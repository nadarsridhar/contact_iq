import { useEffect, useRef, useState } from "react";

export function useInternetStatus() {
  const BASE_URL = window.APP_CONFIG.API_URL;
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  async function checkInternetAccess() {
    try {
      const response = await fetch(BASE_URL + "/api/health", {
        method: "HEAD",
        cache: "no-store",
      });
      return Promise.resolve(response);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // Passive detection via browser events
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      checkInternetAccess()
        .then((isOnline) => {
          setIsOnline(true);
          console.log(isOnline ? "Real internet access" : "No internet access");
        })
        .catch((err) => setIsOnline(false));
    }, 1000);

    // Stop polling after 1 hour
    timeoutRef.current = setTimeout(() => {
      clearInterval(intervalRef.current);
      console.log("🛑 Stopped web socket polling after 1 hour");
    }, 3600000); // 1 hour = 3600 * 1000 ms

    return () => {
      // Cleanup on unmount
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return isOnline;
}
