import { useState } from "react";

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
  function add(value: string) {
    const next = values.includes(value) ? values : [...values, value];
    setValues(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Kept for this visit only.
    }
  }
  return [values, add];
}
