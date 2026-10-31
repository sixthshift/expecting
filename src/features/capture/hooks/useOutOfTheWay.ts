import { useEffect, useState } from "react";

/** How far the page must move (px) before the "+" goes or comes back: a wobble of the thumb isn't a scroll. */
const NUDGE = 12;

/**
 * Whether the floating "+" should step out of the way: while the page is
 * being scrolled down, through what's being read, so it never sits over the
 * line under the thumb. It comes back on any scroll up, and at the top and
 * the bottom of the page, where there's room left for it.
 */
export function useOutOfTheWay(): boolean {
  const [away, setAway] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    function judge() {
      frame = 0;
      const y = window.scrollY;
      const end = y + window.innerHeight >= document.documentElement.scrollHeight - 8;
      if (y < 64 || end) setAway(false);
      else if (y - last > NUDGE) setAway(true);
      else if (last - y > NUDGE) setAway(false);
      else return;
      last = y;
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(judge);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return away;
}
