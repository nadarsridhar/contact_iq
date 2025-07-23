import { useEffect, useState } from "react";

export function useNetworkQuality() {
  const [isGoodConnection, setIsGoodConnection] = useState(true);

  useEffect(() => {
    const update = () => {
      const conn =
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection;

      if (conn) {
        const isGood =
          conn.effectiveType === "4g" &&
          conn.downlink > 2 &&
          conn.rtt < 100 &&
          !conn.saveData;

        setIsGoodConnection(isGood);
      }
    };

    update();

    const conn = navigator.connection;
    conn?.addEventListener("change", update);

    return () => {
      conn?.removeEventListener("change", update);
    };
  }, []);

  return isGoodConnection;
}
