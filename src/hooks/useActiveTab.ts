// hooks/useActiveTab.js
import { useEffect, useRef, useState } from "react";

const useActiveTab = () => {
  const [isActiveTab, setIsActiveTab] = useState(true);
  const broadcast = useRef(null);

  useEffect(() => {
    broadcast.current = new BroadcastChannel("tab-control");

    const notifyOthers = () => {
      broadcast.current.postMessage({ type: "NEW_TAB_OPENED" });
    };

    const handleMessage = (event) => {
      if (event.data.type === "NEW_TAB_OPENED") {
        setIsActiveTab(false); // mark this tab as stale
      }
    };

    broadcast.current.addEventListener("message", handleMessage);
    notifyOthers(); // announce yourself

    return () => {
      broadcast.current.removeEventListener("message", handleMessage);
      broadcast.current.close();
    };
  }, []);

  return { isActiveTab };
};

export default useActiveTab;
