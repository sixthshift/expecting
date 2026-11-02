import { type RefObject, useEffect, useRef } from "react";

/** How far a finger must travel sideways, in px, for a swipe. */
const DISTANCE = 64;
/** A touch starting this close to the screen's edge is the phone's own back gesture, not ours. */
const EDGE = 24;

/** Whether the touch began on something that moves sideways itself, or takes typing: those keep their touches. */
function ownsTouch(target: EventTarget | null, root: HTMLElement): boolean {
  for (let el = target instanceof Element ? target : null; el && el !== root; el = el.parentElement) {
    if (el.matches("input, textarea, select, [contenteditable], [data-no-swipe]")) return true;
    const { overflowX } = getComputedStyle(el);
    if ((overflowX === "auto" || overflowX === "scroll") && el.scrollWidth > el.clientWidth) return true;
  }
  return false;
}

/**
 * A sideways swipe on `ref`'s element: left (the finger moving left) for
 * `onLeft`, right for `onRight`. Mostly sideways only, so scrolling down a
 * page never turns it; the page follows the finger a little, and less towards
 * a side with nothing there.
 */
export function useSwipe(ref: RefObject<HTMLElement | null>, handlers: { onLeft?: () => void; onRight?: () => void }) {
  const latest = useRef(handlers);
  latest.current = handlers;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let start: { x: number; y: number } | null = null;
    let sideways = false;

    const settle = () => {
      el.style.transition = "transform 150ms ease-out";
      el.style.transform = "";
    };
    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      start = null;
      sideways = false;
      if (e.touches.length !== 1 || !t || t.clientX < EDGE || t.clientX > window.innerWidth - EDGE || ownsTouch(e.target, el)) return;
      start = { x: t.clientX, y: t.clientY };
    };
    const onMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!start || !t) return;
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      // Decided once it's clearly one way: a scroll stays a scroll.
      if (!sideways) {
        if (Math.abs(dy) > 10 && Math.abs(dy) >= Math.abs(dx)) start = null;
        else if (Math.abs(dx) > 10) sideways = true;
        if (!sideways) return;
      }
      const there = dx < 0 ? latest.current.onLeft : latest.current.onRight;
      el.style.transition = "none";
      el.style.transform = `translateX(${dx * (there ? 0.35 : 0.1)}px)`;
    };
    const onEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      const began = start;
      start = null;
      if (!began || !t || !sideways) return;
      settle();
      const dx = t.clientX - began.x;
      const dy = t.clientY - began.y;
      if (Math.abs(dx) < DISTANCE || Math.abs(dx) < Math.abs(dy) * 1.5 || window.getSelection()?.toString()) return;
      (dx < 0 ? latest.current.onLeft : latest.current.onRight)?.();
    };
    const onCancel = () => {
      start = null;
      if (sideways) settle();
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: true });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onCancel);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onCancel);
      el.style.transform = "";
    };
  }, [ref]);
}
