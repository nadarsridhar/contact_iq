import axios from "axios";
import { useEffect } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { decryptData, encryptData } from "./encryptDecrypt";
import { useSIPProvider } from "@/components/SipProvider";
import { toast } from "sonner";

// const apiClient = axios.create({ withCredentials: true });
const apiClient = axios.create({ withCredentials: true });

export const useAxiosWithAuth = () => {
  const { token, logout } = useAuth(); // Get token from AuthContext
  const { sessionManager } = useSIPProvider();

  useEffect(() => {
    apiClient.interceptors.request.handlers = [];
    apiClient.interceptors.response.handlers = [];

    const requestInterceptor = apiClient.interceptors.request.use(
      (config) => {
        if (config.data && window.APP_CONFIG.E_MODE) {
          config.data = { payload: encryptData(config.data) }; // Encrypt request body
        }
        if (token) {
          config.headers.Authorization = `Bearer ${token}`; // Set token in headers
        }
        return config;
      },
      async (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => {
        if (response.data && window.APP_CONFIG.E_MODE) {
          response.data = decryptData(response.data); // Decrypt response
        }
        return response;
      },
      async (error) => {
        if (error?.response?.data?.code == 22) {
          toast.dismiss();
          toast.error(error?.response?.data?.message);
          return Promise.reject(error);
        } else if (error?.response?.data && window.APP_CONFIG.E_MODE) {
          error.response.data = decryptData(error.response.data);
        } else if (
          error?.response?.status === 401 &&
          !(
            error?.config?.url?.includes("login") ||
            error?.config?.url?.includes("getLoggedInUserInfo")
          )
        ) {
          await sessionManager?.unregister();
          await sessionManager?.disconnect();

          // Server logout
          await logout(false);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
      apiClient.interceptors.response.eject(responseInterceptor);
    };
  }, [token]); // Re-run when token changes
};

export interface ApiErrorResponse {
  success: false;
  message: string;
  statusCode?: number;
  details?: string;
}

export function handleAxiosError(error: unknown): ApiErrorResponse {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      // Network error or timeout
      return { success: false, message: "Network Error or Timeout" };
    }

    // Extract API error response
    return {
      success: false,
      message: error.response.data?.message || "API Error",
      statusCode: error.response.status,
    };
  } else if (error instanceof Error) {
    return { success: false, message: error.message };
  }

  return { success: false, message: "Unexpected error occurred" };
}

export default apiClient;
