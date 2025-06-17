import { ConsoleLayout } from "@pipecat-ai/ui";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

//@ts-ignore - fontsource-variable/geist is not typed
import "@fontsource-variable/geist";
//@ts-ignore - fontsource-variable/geist is not typed
import "@fontsource-variable/geist-mono";

createRoot(document.getElementById("root")!).render(
  // @ts-ignore
  <StrictMode>
    <div className="pipecat-ui">
      <ConsoleLayout
        clientOptions={{
          params: {
            baseUrl: "/api/offer",
          }
        }}
        onConnect={async () => Promise.resolve(new Response())}
        transportType="smallwebrtc"
      />
    </div>
  </StrictMode>
);
