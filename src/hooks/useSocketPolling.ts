import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const useSocketPolling = ({ isAuthenticated = false, token = "" } = {}) => {
  const socketRef = useRef(null);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  const handleSocketConnect = () => {
    if (socketRef.current) {
      socketRef.current.auth = { token: `Bearer ${token}` };
      socketRef.current.connect();
    }
  };

  const handleSocketDisconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current.removeAllListeners();
    }
  };

  const BASE_URL = window.APP_CONFIG.API_URL;
  useEffect(() => {
    if (!isAuthenticated) return;

    socketRef.current = io(BASE_URL, {
      autoConnect: false,
      transports: ["websocket"],
      reconnection: false,
      // reconnectionAttempts: 100,
      // reconnectionDelay: 5000,
    });

    socketRef.current.connect();

    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current.id);
      setIsWebSocketConnected(true);
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setIsWebSocketConnected(false);
    });

    // Poll every 5 seconds
    intervalRef.current = setInterval(() => {
      if (socketRef.current?.connected) {
        setIsWebSocketConnected(true);
      } else {
        socketRef.current.connect();
        setIsWebSocketConnected(false);
      }
    }, 5000);

    // Stop polling after 1 hour
    timeoutRef.current = setTimeout(() => {
      clearInterval(intervalRef.current);
      console.log("🛑 Stopped web socket polling after 1 hour");
    }, 3600000); // 1 hour = 3600 * 1000 ms

    return () => {
      // Cleanup on unmount
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
      socketRef.current?.disconnect();
    };
  }, [isAuthenticated]);

  return {
    socketRef,
    isWebSocketConnected,
    setIsWebSocketConnected,
    handleSocketConnect,
    handleSocketDisconnect,
  };
};

export default useSocketPolling;
