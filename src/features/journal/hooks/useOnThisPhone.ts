import { useCallback, useState } from "react";

/** Read what this phone keeps under `key`; nothing if it can't (a private window, storage blocked). */
function read(key: string): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(value) ? value.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

/**
 * A short list this phone keeps for itself, and only for itself: what it's
 * put away (the one invitation) or opened (a recap). A convenience, never
 * shared state: without storage it's simply empty.
 */
export function useOnThisPhone(key: string): [readonly string[], (value: string) => void] {
  const [values, setValues] = useState(() => read(key));
  // The same function every render, so a part given it can skip drawing again.
  const add = useCallback(
    (value: string) =>
      setValues((values) => {
        const next = values.includes(value) ? values : [...values, value];
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // Kept for this visit only.
        }
        return next;
      }),
    [key]
  );
  return [values, add];
}
