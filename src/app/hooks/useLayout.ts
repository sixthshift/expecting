import { useSyncExternalStore } from "react";
import { DESKTOP_MEDIA, type Layout, layoutNow } from "../model/layout";

function follow(onChange: () => void): () => void {
  const media = window.matchMedia(DESKTOP_MEDIA);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/**
 * The layout this screen gets (`phone` or `desktop`), followed as the window
 * is resized across the line, so a part that's different in each draws the
 * one that fits. A page chooses under its provider
 * (`layout === "desktop" ? <X /> : <Y />`), so what it holds (search words,
 * what's open) carries across. A small change of the same structure (a gap,
 * a size) is the `desktop:` or `phone:` variant instead, which follows the
 * same line from `<html data-layout>`.
 */
export function useLayout(): Layout {
  // The server only draws the shell (SPA mode), so its answer is never shown.
  return useSyncExternalStore(follow, layoutNow, () => "phone");
}
