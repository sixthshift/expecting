import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

/** How many frames to look for the new page's heading: a page still loading draws its skeleton first. */
const TRIES = 60;

/**
 * After moving to another page, put the keyboard's place on its heading, as
 * a new page in a browser would: a screen reader says where you've arrived,
 * and the next Tab starts at the top of the page, not back in the tab bar or
 * the sidebar. Once the router has drawn the new page (`onRendered`), so it's
 * the new heading, not the old one on its way out. Not on the first page (the
 * browser starts at the top anyway), not when only the search changes (the
 * same page, another week or lens), and never away from something being typed
 * in or a dialog. Focused without scrolling, and with no ring after a tap or
 * a click (touch.css).
 */
export function useFocusOnArrival(): void {
  const router = useRouter();
  useEffect(() => {
    let frame = 0;
    const unsubscribe = router.subscribe("onRendered", ({ fromLocation, pathChanged }) => {
      if (!fromLocation || !pathChanged) return;
      cancelAnimationFrame(frame);
      let tries = TRIES;
      const look = () => {
        const active = document.activeElement;
        if (active?.closest("input, textarea, select, [contenteditable], [role='dialog'], [role='alertdialog']")) return;
        const heading = document.querySelector<HTMLElement>("main h1");
        if (!heading) {
          if (--tries > 0) frame = requestAnimationFrame(look);
          return;
        }
        if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      };
      frame = requestAnimationFrame(look);
    });
    return () => {
      unsubscribe();
      cancelAnimationFrame(frame);
    };
  }, [router]);
}
