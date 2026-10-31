// The page's half of sharing into Expecting: what another app shared, kept by
// the service worker (src/pwa/worker.js, `share`) as it opened the app, taken
// once by the "+" (src/features/capture/components/SharedIn.tsx). Taken on the
// first page in the frame, so a share outlasts logging in or the first-run
// questions; one left longer than FRESH_MS is let go, not offered out of the blue.

import { SHARED_CACHE } from "./caches";

/** What was shared: files (photos, a PDF), and any words or a link, one to a line. */
export type Shared = { files: File[]; text: string | null };

/** How long a share waits to be taken. */
const FRESH_MS = 60 * 60 * 1000;

/** What the worker kept beside the files. */
type What = { at: number; files: number; text: string | null };

/** What was shared, once: it's gone from the phone as it's taken. Null when nothing was, or it's stale. Never throws. */
export async function takeShared(now = Date.now()): Promise<Shared | null> {
  try {
    if (!(await caches.has(SHARED_CACHE))) return null;
    const cache = await caches.open(SHARED_CACHE);
    const kept = await cache.match("/shared/what");
    const what: What | null = kept ? await kept.json() : null;
    const shared = what && now - what.at < FRESH_MS ? { files: await filesOf(cache, what.files), text: what.text } : null;
    await caches.delete(SHARED_CACHE);
    return shared && (shared.files.length > 0 || shared.text) ? shared : null;
  } catch {
    // No Cache Storage (an insecure origin): nothing could have been shared.
    return null;
  }
}

async function filesOf(cache: Cache, count: number): Promise<File[]> {
  const files: File[] = [];
  for (let i = 0; i < count; i++) {
    const kept = await cache.match(`/shared/${i}`);
    if (!kept) continue;
    const name = decodeURIComponent(kept.headers.get("x-name") ?? "") || `Shared ${i + 1}`;
    files.push(new File([await kept.blob()], name, { type: kept.headers.get("content-type") ?? "" }));
  }
  return files;
}
