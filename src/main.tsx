import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";

import App from "@/App";
import {
  FallbackComponent,
  onReset,
} from "@/components/error-boundary/FallbackComponent";
import "@/index.css";
import { apiClient } from "./utils";

const fetchConfig = async () => {
  try {
    const response = await fetch("/config.json");
    const config = await response.json();
    window.APP_CONFIG = config;
  } catch (error) {
    console.error("Failed to load config:", error);
    window.APP_CONFIG = {
      API_URL: "",
      SIP_HOST: "",
      SIP_WS: "",
      ICE_SERVER: "",
      ICE_TIMEOUT: 5000,
      APP_NAME: "Contact IQ",
      E_MODE: false,
      L_MOPDE: 1,
      TOP_LEFT_CONTENT: "",
      BOTTOM_LEFT_CONTENT: "",
      BOTTOM_RIGHT_CONTENT: "",
      TOP_RIGHT_CONTENT: "",
      CALL_TRANSFER: false,
      E_KEYS: false,
    };
  }
};

fetchConfig().then(() => {
  apiClient.defaults.baseURL = window.APP_CONFIG.API_URL;
  document.title = window.APP_CONFIG.APP_NAME;
  createRoot(document.getElementById("root")!).render(
    <ErrorBoundary
      FallbackComponent={FallbackComponent}
      onReset={onReset}
      onError={(error, errorInfo) => {
        console.error("Error boundary:", error.message);
        console.error("Stack trace:", error.stack); // Print stack trace
        console.error("Error Info:", errorInfo.componentStack); // Component stack
      }}
    >
      <App />
    </ErrorBoundary>
  );
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js").then(() => {
    console.log("Service Worker Registered");
  });
}
