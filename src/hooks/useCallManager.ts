import { useCallback, useEffect, useRef } from "react";

import { useSIPProvider } from "@/components/SipProvider";
import { useAuth } from "@/contexts/AuthContext";
import { usePrivilege } from "@/contexts/PrivilegeContext";
import { RegisterStatus } from "@/utils";

function useCallManager() {
  const {
    agent,
    isWebSocketConnected,
    isTabActive,
    isAuthenticated,
    isWindowFocused,
  } = useAuth();
  const { connectAndRegister, sessionManager, registerStatus } =
    useSIPProvider();
  const { isWebrtcAllowed } = usePrivilege();
  const activeSessionId = Boolean(
    sessionManager?.managedSessions[0]?.session?.id
  );
  const intervalRef = useRef(null);
  const countRef = useRef(0);
  const timeoutRef = useRef(null);
  const isConnectingRef = useRef(false);
  const lastRunRef = useRef(0);
  const THROTTLE_MS = 3000;

  // async function connectWebrtc() {
  //   if (isConnecting.current) return;

  //   if (
  //     isAuthenticated &&
  //     isWebrtcAllowed &&
  //     agent?.UserMobileNumber &&
  //     agent?.Password &&
  //     isWebSocketConnected &&
  //     !activeSessionId &&
  //     (isTabActive || isWindowFocused) &&
  //     registerStatus === RegisterStatus.UNREGISTERED
  //   ) {
  //     if (!isConnecting.current) {
  //       isConnecting.current = true;
  //       console.log("Connecting internet call..");

  //       try {
  //         if (sessionManager) {
  //           await sessionManager?.unregister();
  //           await sessionManager?.disconnect();
  //           console.log("Unregistered and disconnected from webrtc..");
  //         }

  //         connectAndRegister({
  //           username: agent.UserMobileNumber,
  //           password: agent.Password,
  //         });
  //       } catch (error) {
  //         console.error("[Internet call] Connection failed:", err);
  //       } finally {
  //         isConnecting.current = false;
  //       }
  //     }
  //   }

  //   // Webrtc unregister if current call is not going and websocket is not connected
  //   const shouldUnregister = !activeSessionId && !isWebSocketConnected;
  //   if (shouldUnregister) {
  //     setRegisterStatus(RegisterStatus.UNREGISTERED);
  //     try {
  //       await sessionManager?.unregister();
  //       await sessionManager?.disconnect();
  //       console.log("[Internet call] Cleaned up unregistered session");
  //     } catch (error) {
  //       console.warn("[Internet call] Cleanup failed:", err);
  //     }
  //     // sessionManager?.unregister().then(() => sessionManager?.disconnect());
  //   }
  // }

  const connectWebrtc = async () => {
    const now = Date.now();

    if (now - lastRunRef.current < THROTTLE_MS) {
      console.log("[Internet call] Skipped due to throttle");
      return;
    }

    if (isConnectingRef.current) {
      console.log("[Internet call] Skipped due to in-progress connection");
      return;
    }

    const canConnect =
      isAuthenticated &&
      isWebrtcAllowed &&
      agent?.UserMobileNumber &&
      agent?.Password &&
      isWebSocketConnected &&
      !activeSessionId &&
      (isTabActive || isWindowFocused) &&
      registerStatus === RegisterStatus.UNREGISTERED;

    if (!canConnect) {
      console.log("[Internet call] Skipped due to unmet preconditions");
      return;
    }

    isConnectingRef.current = true;
    lastRunRef.current = now;

    try {
      console.log("[Internet call] Starting connection...");

      if (sessionManager) {
        await sessionManager.unregister();
        await sessionManager.disconnect();
        console.log("[Internet call] Previous session cleaned");
      }

      await connectAndRegister({
        username: agent.UserMobileNumber,
        password: agent.Password,
      });

      console.log("[Internet call] Connected & Registered");
    } catch (err) {
      console.error("[Internet call] Failed to connect:", err);
    } finally {
      isConnectingRef.current = false;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      connectWebrtc();
    }, THROTTLE_MS);

    return () => clearTimeout(timer);
  }, [
    isAuthenticated,
    isWebrtcAllowed,
    agent?.UserMobileNumber,
    agent?.Password,
    isWebSocketConnected,
    activeSessionId,
    isTabActive,
    isWindowFocused,
    registerStatus,
  ]);

  useEffect(() => {
    if (
      !agent ||
      !isWebrtcAllowed ||
      registerStatus === RegisterStatus.REGISTERED
    ) {
      countRef.current = 0;
      clearInterval(intervalRef.current);
      return;
    }

    if (!isWebSocketConnected) {
      sessionManager?.unregister().then(() => sessionManager?.disconnect());
      return;
    }

    // Poll every second
    intervalRef.current = setInterval(() => {
      if (registerStatus === RegisterStatus.UNREGISTERED) {
        countRef.current++;
        console.log("Attempting internet call connection..", countRef.current);
        connectAndRegister({
          username: agent.UserMobileNumber,
          password: agent.Password,
        });
      }
    }, 5000);

    // Stop polling after 1 hour
    timeoutRef.current = setTimeout(() => {
      countRef.current = 0;
      clearInterval(intervalRef.current);
      console.log("🛑 Stopped internet call socket polling after 1 hour");
    }, 3600000); // 1 hour = 3600 * 1000 ms

    return () => {
      // Cleanup on unmount
      clearInterval(intervalRef.current);
    };
  }, [
    agent?.UserMobileNumber,
    agent?.Password,
    registerStatus,
    isWebrtcAllowed,
    isWebSocketConnected,
  ]);

  // On unmount unregister and cleanup (page refresh, logout events)
  useEffect(() => {
    return () => {
      sessionManager?.unregister().then(() => sessionManager?.disconnect());
    };
  }, []);
}

export default useCallManager;
