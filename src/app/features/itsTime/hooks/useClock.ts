import { useEffect, useState } from "react";

/** Now, again every `everyMs`: for a running contraction's seconds and the last hour's pattern. */
export function useClock(everyMs: number): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), everyMs);
    return () => clearInterval(id);
  }, [everyMs]);
  return now;
}
