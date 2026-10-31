/**
 * A touch you can feel, for a thing done: the lightest tap the phone has, on
 * an Android phone (Safari has no vibration, and a desktop has no motor). Not
 * for anyone who has asked for less motion, and never more than this: a tick
 * is a small thing, and it should feel like one.
 */
export function feelDone(): void {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  navigator.vibrate(8);
}
