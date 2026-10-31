// The browser's half of the service worker (src/pwa/worker.js): registered
// once the page is up, and only from a build. The dev server is on the same
// port as `bun run start`, so a worker a build left behind is taken away
// there, rather than answer for files Vite now serves.

import { DATA_CACHE, FILES_CACHE, SHARED_CACHE } from "./caches";

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

/** Forget the data the worker keeps for offline, the pictures, and a share not yet taken, as this phone logs out. */
export async function forgetData(): Promise<void> {
  try {
    await caches.delete(DATA_CACHE);
    await caches.delete(FILES_CACHE);
    await caches.delete(SHARED_CACHE);
  } catch {
    // No Cache Storage (an insecure origin): nothing was kept.
  }
}

/** Forget what the worker kept of one upload (its pictures, a kept PDF), as it's deleted. */
export async function forgetFile(id: string): Promise<void> {
  try {
    const cache = await caches.open(FILES_CACHE);
    for (const request of await cache.keys()) if (new URL(request.url).pathname.startsWith(`/api/files/${id}/`)) await cache.delete(request);
  } catch {
    // No Cache Storage: nothing was kept.
  }
}

/**
 * Keep these files on this phone for reading with no signal (a handy paper's
 * pages: its PDF, or its pictures' copies), and let these go (a PDF whose paper
 * isn't handy any more). Only what isn't kept already is fetched. Never
 * throws: a file that won't come now is fetched next time the list does.
 */
export async function keepHandyOffline({ keep, drop }: { keep: readonly string[]; drop: readonly string[] }): Promise<void> {
  try {
    const cache = await caches.open(FILES_CACHE);
    for (const url of drop) await cache.delete(url);
    for (const url of keep) {
      if (await cache.match(url)) continue;
      try {
        await cache.add(url);
      } catch {
        // Offline, or not up yet (still on the phone that kept it): next time.
      }
    }
  } catch {
    // No Cache Storage (an insecure origin): nothing can be kept.
  }
}
