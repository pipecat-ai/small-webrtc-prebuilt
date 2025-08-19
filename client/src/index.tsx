import {
  ConsoleTemplate,
  FullScreenContainer,
  ThemeProvider,
} from "@pipecat-ai/voice-ui-kit";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

//@ts-ignore - fontsource-variable/geist is not typed
import "@fontsource-variable/geist";
//@ts-ignore - fontsource-variable/geist is not typed
import "@fontsource-variable/geist-mono";

// Utility function to safely extract config from data attribute
function getConfig(): Record<string, any> | null {
  try {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      console.warn("Root element not found");
      return null;
    }

    const configData = rootElement.getAttribute("data-config");
    if (!configData) {
      console.warn("No config data found in root element");
      return null;
    }

    const config = JSON.parse(configData);
    console.log("Loaded config:", config);
    return config;
  } catch (error) {
    console.error("Failed to parse config:", error);
    return null;
  }
}

const config = getConfig();

createRoot(document.getElementById("root")!).render(
  // @ts-ignore
  <StrictMode>
    <ThemeProvider>
      <FullScreenContainer>
        <ConsoleTemplate
          connectParams={{
            webrtcUrl: "/api/offer",
            ...(config?.connectParams || {}),
          }}
          transportType="smallwebrtc"
          {...(config || {})}
        />
      </FullScreenContainer>
    </ThemeProvider>
  </StrictMode>
);
