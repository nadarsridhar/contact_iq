import { useEffect, useState } from "react";

export function useSingleTabControl() {
  const [isStale, setIsStale] = useState(false);

  const LOCK_KEY = "single-tab-lock";
  const LOCK_TIMEOUT = 1000; // 10 seconds timeout
  const TAB_ID = `${Date.now()}-${Math.random()}`;

  const getLock = () => {
    const raw = localStorage.getItem(LOCK_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const isLockExpired = (lock: { id: string; timestamp: number }) => {
    return Date.now() - lock.timestamp > LOCK_TIMEOUT;
  };

  const acquireLock = () => {
    const lock = { id: TAB_ID, timestamp: Date.now() };
    localStorage.setItem(LOCK_KEY, JSON.stringify(lock));
    setIsStale(false);
  };

  const releaseLock = () => {
    const lock = getLock();
    if (lock?.id === TAB_ID) {
      localStorage.removeItem(LOCK_KEY);
    }
  };

  const checkAndAcquireLock = () => {
    const lock = getLock();

    if (!lock || isLockExpired(lock)) {
      acquireLock();
    } else if (lock.id !== TAB_ID) {
      setIsStale(true);
    }
  };

  useEffect(() => {
    checkAndAcquireLock();

    const onStorage = (e: StorageEvent) => {
      if (e.key === LOCK_KEY) {
        checkAndAcquireLock();
      }
    };

    const onFocusOrVisibility = () => {
      checkAndAcquireLock();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("beforeunload", releaseLock);
    window.addEventListener("unload", releaseLock);
    // window.addEventListener("focus", onFocusOrVisibility);
    // document.addEventListener("visibilitychange", onFocusOrVisibility);

    // Heartbeat (update lock timestamp every few seconds if master)
    const heartbeat = setInterval(() => {
      const lock = getLock();
      if (lock?.id === TAB_ID) {
        localStorage.setItem(
          LOCK_KEY,
          JSON.stringify({ id: TAB_ID, timestamp: Date.now() })
        );
      }
    }, 4000);

    return () => {
      clearInterval(heartbeat);
      releaseLock();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("beforeunload", releaseLock);
      window.removeEventListener("unload", releaseLock);
      // window.removeEventListener("focus", onFocusOrVisibility);
      // document.removeEventListener("visibilitychange", onFocusOrVisibility);
    };
  }, []);

  return {
    isStale,
    isMaster: !isStale,
    tabId: TAB_ID,
  };
}
