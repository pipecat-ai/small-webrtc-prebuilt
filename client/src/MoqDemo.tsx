/*
 * Copyright (c) 2024-2026, Daily
 *
 * SPDX-License-Identifier: BSD-2-Clause
 *
 * Minimal MoQ smoke harness for the pipecat-prebuilt playground.
 *
 * Bypasses `<ConsoleTemplate>` because voice-ui-kit's `transportType`
 * union is hardcoded to "smallwebrtc" | "daily" and doesn't yet know
 * about MoQ. The follow-up plan is to extend voice-ui-kit so MoQ shows
 * up as a first-class transport choice; until then this component
 * proves the `@pipecat-ai/moq-transport` package works end-to-end with
 * `PipecatClient`.
 */

import { useCallback, useEffect, useRef, useState } from "react";

import {
  type BotLLMTextData,
  type BotReadyData,
  PipecatClient,
  type TransportState,
  type TranscriptData,
} from "@pipecat-ai/client-js";

import { MoqTransport } from "@pipecat-ai/moq-transport";

type StartResponse = {
  sessionId?: string;
  moq?: {
    relayUrl: string;
    certHash: string | null;
    namespace: string;
    clientId: string;
    botId: string;
    publishTrack: string;
    subscribeTrack: string;
    transcriptTrack: string;
    messageTrack: string;
  };
};

type TranscriptRow = {
  id: string;
  role: "user" | "assistant";
  text: string;
  final: boolean;
};

/** Convert the server's base64 SHA-256 cert hash into the
 *  ArrayBuffer shape that WebTransport.serverCertificateHashes expects. */
function decodeCertHash(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

export function MoqDemo() {
  const clientRef = useRef<PipecatClient | null>(null);
  const transcriptTurnRef = useRef<TranscriptRow | null>(null);
  const [state, setState] = useState<TransportState>("disconnected");
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<TranscriptRow[]>([]);
  const [micEnabled, setMicEnabled] = useState(true);

  const append = useCallback((role: "user" | "assistant", text: string) => {
    if (!text) return;
    setRows((prev) => {
      const last = prev[prev.length - 1];
      // Turn-level aggregation: append to the in-progress row of the same
      // role until a turn boundary flips. The MoqTransport already
      // dispatches the underlying RTVI messages, but the kit's
      // ConversationProvider isn't in this minimal harness so we do it
      // by hand here.
      if (last && last.role === role && !last.final) {
        const next = [...prev];
        next[next.length - 1] = { ...last, text: `${last.text} ${text}` };
        return next;
      }
      return [
        ...prev,
        {
          id: `${Date.now()}-${prev.length}`,
          role,
          text,
          final: false,
        },
      ];
    });
  }, []);

  const finalizeRole = useCallback((role: "user" | "assistant") => {
    setRows((prev) => {
      const last = prev[prev.length - 1];
      if (!last || last.role !== role || last.final) return prev;
      const next = [...prev];
      next[next.length - 1] = { ...last, final: true };
      return next;
    });
  }, []);

  const handleConnect = useCallback(async () => {
    setError(null);
    setRows([]);

    // Ask the server to start the bot. Returns the relay URL, cert
    // hash, and per-participant ids the MoqTransport needs.
    let startInfo: StartResponse;
    try {
      const resp = await fetch("/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transport: "moq" }),
      });
      if (!resp.ok) {
        throw new Error(`/start returned HTTP ${resp.status}`);
      }
      startInfo = (await resp.json()) as StartResponse;
    } catch (err) {
      setError(`Failed to start bot: ${err instanceof Error ? err.message : String(err)}`);
      return;
    }
    if (!startInfo.moq) {
      setError("/start did not return MoQ config (server may not be -t moq)");
      return;
    }

    const moq = startInfo.moq;
    const transport = new MoqTransport({
      relayUrl: moq.relayUrl,
      clientId: moq.clientId,
      botId: moq.botId,
      namespace: moq.namespace,
      publishTrack: moq.publishTrack,
      subscribeTrack: moq.subscribeTrack,
      transcriptTrack: moq.transcriptTrack,
      messageTrack: moq.messageTrack,
      serverCertificateHashes: moq.certHash
        ? [{ algorithm: "sha-256", value: decodeCertHash(moq.certHash) }]
        : undefined,
    });

    const client = new PipecatClient({
      transport,
      callbacks: {
        onTransportStateChanged: (next: TransportState) => setState(next),
        onUserTranscript: (data: TranscriptData) => {
          if (!data.final) return;
          append("user", data.text);
          finalizeRole("user");
        },
        onBotLlmStarted: () => {
          transcriptTurnRef.current = null;
        },
        onBotLlmText: (data: BotLLMTextData) => append("assistant", data.text),
        onBotLlmStopped: () => finalizeRole("assistant"),
        onBotReady: (data: BotReadyData) => {
          console.log("[MoqDemo] bot ready", data);
        },
      },
    });

    clientRef.current = client;

    try {
      await client.connect();
    } catch (err) {
      setError(`Connect failed: ${err instanceof Error ? err.message : String(err)}`);
      clientRef.current = null;
    }
  }, [append, finalizeRole]);

  const handleDisconnect = useCallback(async () => {
    const client = clientRef.current;
    if (!client) return;
    try {
      await client.disconnect();
    } catch (err) {
      console.warn("[MoqDemo] disconnect error", err);
    }
    clientRef.current = null;
  }, []);

  const toggleMic = useCallback(() => {
    const client = clientRef.current;
    if (!client) return;
    const next = !micEnabled;
    client.enableMic(next);
    setMicEnabled(next);
  }, [micEnabled]);

  // Disconnect on unmount.
  useEffect(() => {
    return () => {
      void clientRef.current?.disconnect().catch(() => {});
    };
  }, []);

  const connected = state === "connected" || state === "ready";

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "16px 24px 24px",
        color: "var(--foreground)",
        background: "var(--background)",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <strong>MoQ demo</strong>
        <span style={{ opacity: 0.6, fontSize: "0.85rem" }}>
          state: <code>{state}</code>
        </span>
        <div style={{ flex: 1 }} />
        {!connected ? (
          <button onClick={handleConnect} style={btnPrimary}>
            Connect
          </button>
        ) : (
          <>
            <button onClick={toggleMic} style={btnSecondary}>
              {micEnabled ? "Mute mic" : "Unmute mic"}
            </button>
            <button onClick={handleDisconnect} style={btnDanger}>
              Disconnect
            </button>
          </>
        )}
      </div>

      {error && (
        <div
          style={{
            padding: "10px 14px",
            border: "1px solid var(--destructive, #b00020)",
            borderRadius: 8,
            color: "var(--destructive, #b00020)",
            fontSize: "0.9rem",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          border: "1px solid var(--border, rgba(255,255,255,0.1))",
          borderRadius: 8,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {rows.length === 0 ? (
          <em style={{ opacity: 0.5 }}>Waiting for conversation…</em>
        ) : (
          rows.map((row) => (
            <div
              key={row.id}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                background:
                  row.role === "user"
                    ? "rgba(80, 120, 200, 0.18)"
                    : "rgba(120, 90, 160, 0.18)",
                maxWidth: "85%",
                alignSelf: "flex-start",
              }}
            >
              <div
                style={{
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  opacity: 0.6,
                  marginBottom: 2,
                }}
              >
                {row.role}
              </div>
              <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {row.text}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const btnBase: React.CSSProperties = {
  padding: "6px 14px",
  borderRadius: 6,
  border: "1px solid transparent",
  fontSize: "0.85rem",
  fontWeight: 500,
  cursor: "pointer",
};

const btnPrimary: React.CSSProperties = {
  ...btnBase,
  background: "var(--primary, #4caf50)",
  color: "white",
};

const btnSecondary: React.CSSProperties = {
  ...btnBase,
  background: "transparent",
  border: "1px solid var(--border, rgba(255,255,255,0.2))",
  color: "var(--foreground)",
};

const btnDanger: React.CSSProperties = {
  ...btnBase,
  background: "transparent",
  border: "1px solid var(--destructive, #b00020)",
  color: "var(--destructive, #b00020)",
};
