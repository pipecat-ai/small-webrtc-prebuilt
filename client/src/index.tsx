import {
  ConsoleTemplate,
  FullScreenContainer,
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
        <div
          style={{
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            borderBottom: "1px solid var(--border)",
            background: "var(--background)",
          }}
        >
          <label
            htmlFor="transport-select"
            style={{
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--foreground)",
            }}
          >
            Transport:
          </label>
          <select
            id="transport-select"
            value={transportType}
            onChange={(e) => setTransportType(e.target.value as TransportType)}
            style={{
              padding: "4px 8px",
              borderRadius: "6px",
              border: "1px solid var(--border)",
              background: "var(--background)",
              color: "var(--foreground)",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            {TRANSPORT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ConsoleTemplate
            key={transportType}
            transportType={
              transportType === "twilio" ? "websocket" : transportType
            }
            startBotParams={startBotParams}
            transportOptions={transportOptions}
            startBotResponseTransformer={startBotResponseTransformer}
            noUserVideo={true}
            onClient={(client) => {
              client.on(RTVIEvent.Connected, async () => {
                await onClientConnected(client);
              });
            }}
          />
        </div>
      </FullScreenContainer>
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Home />
  </StrictMode>,
);
