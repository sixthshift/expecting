/**
 * Which of the two experiences this screen gets: `mobile` (the tab bar under
 * the thumb, one thing at a time) or `desktop` (the top bar, a pillar's rail, things side by
 * side). Each is designed on its own, and within each the page still flows
 * with the width (Tailwind's `sm:`).
 */
export type Layout = "mobile" | "desktop";

/** Where a phone's layout ends and the desktop's begins: 64rem, what was Tailwind's `lg`. */
export const DESKTOP_MEDIA = "(min-width: 64rem)";

/** The layout right now, outside React: for an effect that must ask once rather than follow it (the timeline's first scroll). */
export function layoutNow(): Layout {
  return window.matchMedia(DESKTOP_MEDIA).matches ? "desktop" : "mobile";
}

/**
 * Puts the layout on `<html data-layout>` before the first paint, and keeps
 * it there as the window is resized, so the `mobile:` and `desktop:` variants
 * (src/styles/index.css) follow the same line `useLayout()` does.
 */
export const LAYOUT_BOOT_SCRIPT = `try{var l=matchMedia(${JSON.stringify(DESKTOP_MEDIA)}),s=function(){document.documentElement.dataset.layout=l.matches?"desktop":"mobile"};s();l.addEventListener("change",s)}catch(e){}`;
