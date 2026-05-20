import {
  ConsoleTemplate,
  FullScreenContainer,
  Select,
  SelectContent,
  SelectGuide,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ThemeProvider,
} from "@pipecat-ai/voice-ui-kit";
import React, { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";

import {
  TwilioSerializer,
  WebSocketTransport,
} from "@pipecat-ai/websocket-transport";
import { PipecatClient, RTVIEvent } from "@pipecat-ai/client-js";

type TransportType = "smallwebrtc" | "daily" | "websocket" | "twilio";

const TRANSPORT_OPTIONS: { value: TransportType; label: string }[] = [
  { value: "smallwebrtc", label: "SmallWebRTC" },
  { value: "daily", label: "Daily" },
  { value: "websocket", label: "WebSocket" },
  // Twilio is also a websocket transport, just with a special serializer
  { value: "twilio", label: "Twilio" },
];

type TransportProps = Pick<
  React.ComponentProps<typeof ConsoleTemplate>,
  "startBotParams" | "transportOptions" | "startBotResponseTransformer"
>;

const websocketResponseTransformer = (response: unknown) => {
  const { wsUrl, token } = response as { wsUrl: string; token?: string };
  return {
    wsUrl: token ? `${wsUrl}?token=${encodeURIComponent(token)}` : wsUrl,
  };
};

function getTransportProps(
  type: TransportType,
): TransportProps {
  switch (type) {
    case "smallwebrtc":
      return {
        startBotParams: {
          endpoint: `/start`,
          requestData: {
            createDailyRoom: false,
            enableDefaultIceServers: true,
            transport: "webrtc",
          },
        },
        transportOptions: {
          waitForICEGathering: true,
        },
      };
    case "daily":
      return {
        startBotParams: {
          endpoint: `/start`,
          requestData: {
            createDailyRoom: true,
            transport: "daily",
          },
        },
      };
    case "websocket":
      return {
        startBotParams: {
          endpoint: `/start`,
          requestData: {
            transport: "websocket",
          },
        },
        startBotResponseTransformer: websocketResponseTransformer,
      };
    case "twilio":
      return {
        startBotParams: {
          endpoint: `/start`,
          requestData: {
            transport: "twilio",
          },
        },
        transportOptions: {
          serializer: new TwilioSerializer(),
          recorderSampleRate: 8000,
          playerSampleRate: 8000,
        },
        startBotResponseTransformer: websocketResponseTransformer,
      };
  }
}

type TransportSelectProps = {
  value: TransportType;
  onValueChange: (value: TransportType) => void;
};

function TransportSelect({ value, onValueChange }: TransportSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onValueChange(next as TransportType)}
    >
      <SelectTrigger
        aria-label="Transport"
        className="transport-select-trigger"
        rounded="lg"
        size="md"
      >
        <SelectGuide>Transport</SelectGuide>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {TRANSPORT_OPTIONS.map(({ value, label }) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Home() {
  const [transportType, setTransportType] =
    useState<TransportType>("smallwebrtc");
  const { startBotParams, transportOptions, startBotResponseTransformer } =
    getTransportProps(transportType);

  const emulateTwilioMessages = async (
    websocketTransport: WebSocketTransport,
  ) => {
    const connectedMessage = {
      event: "connected",
      protocol: "Call",
      version: "1.0.0",
    };
    void websocketTransport?.sendRawMessage(connectedMessage);
    const startMessage = {
      event: "start",
      start: {
        streamSid: "mock",
        callSid: "mock",
      },
    };
    void websocketTransport?.sendRawMessage(startMessage);
  };

  const onClientConnected = async (pipecatClient: PipecatClient) => {
    if (transportType === "twilio") {
      await emulateTwilioMessages(
        pipecatClient.transport as WebSocketTransport,
      );
    }
  };

  return (
    <ThemeProvider>
      <FullScreenContainer className="items-stretch justify-start">
        <ConsoleTemplate
          key={transportType}
          transportType={
            transportType === "twilio" ? "websocket" : transportType
          }
          startBotParams={startBotParams}
          transportOptions={transportOptions}
          startBotResponseTransformer={startBotResponseTransformer}
          noUserVideo={true}
          logoComponent={
            <TransportSelect
              value={transportType}
              onValueChange={setTransportType}
            />
          }
          onClient={(client) => {
            client.on(RTVIEvent.Connected, async () => {
              await onClientConnected(client);
            });
          }}
        />
      </FullScreenContainer>
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Home />
  </StrictMode>,
);
