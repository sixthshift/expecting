import { useEffect } from "react";

/**
 * Keeps the screen on while `on` (the Screen Wake Lock API, where the phone has
 * it): timing contractions shouldn't mean unlocking the phone for each one. The
 * lock is let go when the page is hidden, so it's asked for again on return.
 */
export function useWakeLock(on: boolean): void {
  useEffect(() => {
    if (!on || typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let gone = false;
    const ask = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const got = await navigator.wakeLock.request("screen");
        if (gone) void got.release();
        else lock = got;
      } catch {
        // Refused (low battery, or not allowed): the screen sleeps as usual.
      }
    };
    void ask();
    document.addEventListener("visibilitychange", ask);
    return () => {
      gone = true;
      document.removeEventListener("visibilitychange", ask);
      void lock?.release();
    };
  }, [on]);
}
