#
# Copyright (c) 2024–2025, Daily
#
# SPDX-License-Identifier: BSD 2-Clause License
#


import os

import cv2
import numpy as np
from dotenv import load_dotenv
from loguru import logger
from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.audio.vad.vad_analyzer import VADParams
from pipecat.frames.frames import Frame, InputImageRawFrame, LLMRunFrame, OutputImageRawFrame
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.processors.aggregators.llm_response_universal import LLMContextAggregatorPair
from pipecat.processors.frame_processor import FrameDirection, FrameProcessor
from pipecat.processors.frameworks.rtvi import RTVIObserver, RTVIProcessor
from pipecat.runner.types import RunnerArguments
from pipecat.runner.utils import create_transport
from pipecat.services.google.gemini_live.llm import GeminiLiveLLMService
from pipecat.transports.base_transport import TransportParams
from pipecat.transports.smallwebrtc.transport import SmallWebRTCTransport

load_dotenv(override=True)

# We store functions so objects (e.g. SileroVADAnalyzer) don't get
# instantiated. The function will be called when the desired transport gets
# selected.
transport_params = {
    "webrtc": lambda: TransportParams(
        audio_in_enabled=True,
        audio_out_enabled=True,
        video_in_enabled=True,
        video_out_enabled=True,
        video_out_is_live=True,
        # set stop_secs to something roughly similar to the internal setting
        # of the Multimodal Live api, just to align events. This doesn't really
        # matter because we can only use the Multimodal Live API's phrase
        # endpointing, for now.
        vad_analyzer=SileroVADAnalyzer(params=VADParams(stop_secs=0.5)),
    ),
}


class EdgeDetectionProcessor(FrameProcessor):
    def __init__(self, camera_out_width, camera_out_height: int):
        super().__init__()
        self._camera_out_width = camera_out_width
        self._camera_out_height = camera_out_height

    async def process_frame(self, frame: Frame, direction: FrameDirection):
        await super().process_frame(frame, direction)

        if isinstance(frame, InputImageRawFrame):
            # Convert bytes to NumPy array
            img = np.frombuffer(frame.image, dtype=np.uint8).reshape(
                (frame.size[1], frame.size[0], 3)
            )

            # perform edge detection
            img = cv2.cvtColor(cv2.Canny(img, 100, 200), cv2.COLOR_GRAY2BGR)

            # convert the size if needed
            desired_size = (self._camera_out_width, self._camera_out_height)
            if frame.size != desired_size:
                resized_image = cv2.resize(img, desired_size)
                frame = OutputImageRawFrame(resized_image.tobytes(), desired_size, frame.format)
                await self.push_frame(frame)
            else:
                await self.push_frame(
                    OutputImageRawFrame(image=img.tobytes(), size=frame.size, format=frame.format)
                )
        else:
            await self.push_frame(frame, direction)


SYSTEM_INSTRUCTION = f"""
"You are Gemini Chatbot, a friendly, helpful robot.

Your goal is to demonstrate your capabilities in a succinct way.

Your output will be converted to audio so don't include special characters in your answers.

Respond to what the user said in a creative and helpful way. Keep your responses brief. One or two sentences at most.
"""


async def run_bot(
    transport: SmallWebRTCTransport, runner_args: RunnerArguments, params: TransportParams
):
    llm = GeminiLiveLLMService(
        api_key=os.getenv("GOOGLE_API_KEY"),
        voice_id="Aoede",  # Puck, Charon, Kore, Fenrir, Aoede
        system_instruction=SYSTEM_INSTRUCTION,
    )

    context = LLMContext(
        [
            {
                "role": "user",
                "content": "Say hello.",
            },
        ],
    )
    context_aggregator = LLMContextAggregatorPair(context)

    # RTVI events for Pipecat client UI
    rtvi = RTVIProcessor()

    pipeline = Pipeline(
        [
            transport.input(),
            context_aggregator.user(),
            rtvi,
            llm,
            EdgeDetectionProcessor(params.video_out_width, params.video_out_height),
            transport.output(),
            context_aggregator.assistant(),
        ]
    )

    task = PipelineTask(
        pipeline,
        params=PipelineParams(
            enable_metrics=True,
            enable_usage_metrics=True,
        ),
        idle_timeout_secs=runner_args.pipeline_idle_timeout_secs,
        observers=[RTVIObserver(rtvi)],
    )

    @rtvi.event_handler("on_client_ready")
    async def on_client_ready(rtvi):
        logger.info("Pipecat client ready.")
        await rtvi.set_bot_ready()
        await task.queue_frames([LLMRunFrame()])

    @transport.event_handler("on_client_connected")
    async def on_client_connected(transport, client):
        logger.info(f"Client connected: {client}")

    @transport.event_handler("on_client_disconnected")
    async def on_client_disconnected(transport, client):
        logger.info(f"Client disconnected")
        await task.cancel()

    runner = PipelineRunner(handle_sigint=runner_args.handle_sigint)

    await runner.run(task)


async def bot(runner_args: RunnerArguments):
    """Main bot entry point compatible with Pipecat Cloud."""
    # Get the params for the webrtc transport
    params = transport_params["webrtc"]()
    transport = await create_transport(runner_args, transport_params)
    await run_bot(transport, runner_args, params)


if __name__ == "__main__":
    from pipecat.runner.run import main

    main()
