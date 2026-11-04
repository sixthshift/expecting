import { useEffect, useRef } from "react";

/** Whether a key press belongs to what has focus: typing, or a control that moves with the arrows itself. */
function ownsKey(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest("input, textarea, select, [contenteditable], [role=slider], [role=tablist]") !== null;
}

/**
 * ← and → on a keyboard, for going through a list: `onLeft` for the one
 * before, `onRight` for the next, each left out where there's none. The keys
 * stay with whatever takes them itself (typing, a slider, tabs), and with a
 * modifier held (the browser's own Back is Alt+←).
 */
export function useArrowKeys({ onLeft, onRight }: { onLeft?: (() => void) | undefined; onRight?: (() => void) | undefined }) {
  const latest = useRef({ onLeft, onRight });
  latest.current = { onLeft, onRight };
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || ownsKey(event.target)) return;
      const go = event.key === "ArrowLeft" ? latest.current.onLeft : event.key === "ArrowRight" ? latest.current.onRight : undefined;
      if (!go) return;
      event.preventDefault();
      go();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
