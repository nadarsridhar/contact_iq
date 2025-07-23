import { useEffect } from "react";
import { useSIPProvider } from "@/components/SipProvider";

function usePageRefresh() {
  const { sessionManager } = useSIPProvider();
  const activeSessionId = sessionManager?.managedSessions[0]?.session?.id;

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!activeSessionId) return;

      // Display a custom message in modern browsers
      // const message =
      //   'Are you sure you want to refresh? Your current session will get disconnected';
      const message = `Are you sure you want to refresh? Your active session will be closed.`;
      event.preventDefault(); // Most browsers don't require this anymore
      event.returnValue = message; // This will show the confirmation dialog
      return message; // For some browsers, this line is necessary
    };

    // Add event listener for beforeunload
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Clean up the event listener when the component is unmounted
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [activeSessionId]);
}

export default usePageRefresh;
