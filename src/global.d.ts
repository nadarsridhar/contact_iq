// src/global.d.ts
export {};

declare global {
  interface Window {
    APP_CONFIG: {
      API_URL: string;
      SIP_HOST: string;
      SIP_WS: string;
      APP_NAME: string;
      ICE_SERVER: string;
      ICE_TIMEOUT: number;
      E_MODE: boolean;
      L_MODE: number;
      CALL_TRANSFER: boolean;
      E_KEYS: boolean;
      [key: string]: any; // Allows additional properties
    };
    callLogger: any;
    flutter_inappwebview: any;
  }
}
