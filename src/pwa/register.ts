// The browser's half of the service worker (src/pwa/worker.js): registered
// once the page is up, and only from a build. The dev server is on the same
// port as `bun run start`, so a worker a build left behind is taken away
// there, rather than answer for files Vite now serves.

import { DATA_CACHE } from "./caches";

/** Register /sw.js, or in dev take away any worker already there. Never throws: offline is a nicety, not a need. */
export function registerWorker(): void {
  if (!("serviceWorker" in navigator)) return;
  if (import.meta.env.PROD) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  } else {
    navigator.serviceWorker
      .getRegistrations()
      .then((all) => Promise.all(all.map((r) => r.unregister())))
      .catch(() => {});
  }
}

/** Forget the data the worker keeps for offline, as this phone logs out. */
export async function forgetData(): Promise<void> {
  try {
    await caches.delete(DATA_CACHE);
  } catch {
    // No Cache Storage (an insecure origin): nothing was kept.
  }
}
