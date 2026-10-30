// Expecting's service worker, hand-written. src/pwa/vite.ts emits it as /sw.js
// at build, with the build's own files written in above this line as VERSION,
// CORE and PAGES, so a new build is a new worker.
//
//   the app       the shell (one page answers every path) and every file the
//                 build made: fetched up front, so the app opens with no
//                 connection, and every built-in item reads offline
//   the data      each server function's last answer, kept as it is fetched,
//                 so what was last on screen opens offline too
//   the pictures  each upload's thumbnail and display copy, kept as it's
//                 first drawn, so the album opens offline; never an original,
//                 and nothing up front, but a handy paper's pages, which the
//                 page puts here itself (keepHandyOffline, ./register.ts), PDF
//                 and all. An upload never changes (each is a new id), so the
//                 cache answers first, and outlives a new build
//
// The network comes first for pages and data, so nothing goes stale while
// there's a connection; the cache answers when there isn't one, or when the
// connection is too slow to wait for (hospital Wi-Fi). The build's files are
// named for their contents, so those come from the cache first.
//
// Writes aren't cached or queued here: the outbox (src/app/model/outbox.ts) holds them.

/* global VERSION, CORE, PAGES, APP_CACHE, DATA_CACHE, FILES_CACHE */

/** The page every path is answered with: the app draws the rest. */
const SHELL = "/";

/** How long to wait on a slow network before the cache answers. The network goes on, and refreshes the cache when it comes. */
const PATIENCE_MS = 4000;

/** Fetched at a time while filling the cache with the items. */
const AT_ONCE = 8;

const appCache = `${APP_CACHE}-${VERSION}`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(appCache);
      await cache.addAll(CORE);
      // Logged out, / is sent on to /login, which is the same shell. A page can't be answered with a
      // response marked redirected, so it is kept as a plain copy.
      const shell = await fetch(SHELL);
      if (!shell.ok) throw new Error(`The shell: ${shell.status}`);
      await cache.put(SHELL, new Response(await shell.blob(), { headers: shell.headers }));
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Every earlier build's files, and the data: its shape may have changed with the build. The page refetches it now.
      // The pictures stay: an upload's bytes don't change with a build.
      for (const name of await caches.keys()) if (name !== appCache && name !== FILES_CACHE) await caches.delete(name);
      await self.clients.claim();
      await fillPages();
    })()
  );
});

/** The items' pages, best effort: one that fails now is fetched when it is opened. */
async function fillPages() {
  const cache = await caches.open(appCache);
  const queue = [...PAGES];
  const worker = async () => {
    for (let path = queue.shift(); path; path = queue.shift()) {
      if (await cache.match(path)) continue;
      try {
        const response = await fetch(path);
        if (response.ok) await cache.put(path, response);
      } catch {
        // Offline, or gone: left for later.
      }
    }
  };
  await Promise.all(Array.from({ length: AT_ONCE }, worker));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  // An upload, even opened as a page (a PDF in its own tab): never answered with the shell.
  if (KEPT_PICTURE.test(url.pathname)) event.respondWith(picture(event));
  else if (KEPT_ORIGINAL.test(url.pathname)) event.respondWith(original(event));
  else if (request.mode === "navigate") event.respondWith(page(event));
  else if (url.pathname.startsWith("/api/rpc/")) event.respondWith(data(event));
  else if (url.pathname.startsWith("/api/")) return;
  else event.respondWith(file(request));
});

/** A page: the network's shell, kept for next time; else the kept one. */
function page(event) {
  return networkFirst(event, appCache, SHELL, (response) => response.ok && (response.headers.get("content-type") ?? "").includes("text/html"));
}

/** A server function's answer: the network's, kept; else the last one kept. An ended session forgets them all, and the pictures. */
async function data(event) {
  return networkFirst(event, DATA_CACHE, event.request, (response) => {
    if (response.status === 401) event.waitUntil(Promise.all([caches.delete(DATA_CACHE), caches.delete(FILES_CACHE)]));
    return response.ok;
  });
}

/** An upload's thumbnail or display copy (src/api/rest/files.ts); never its original, which can be large. */
const KEPT_PICTURE = /^\/api\/files\/[0-9a-f-]{36}\/(thumb|display)$/;

/** A picture: the cache's, else the network's, kept. It can't change, so the cache never goes stale. */
async function picture(event) {
  const cache = await caches.open(FILES_CACHE);
  const kept = await cache.match(event.request);
  if (kept) return kept;
  const response = await fetch(event.request);
  if (response.ok) event.waitUntil(cache.put(event.request, response.clone()));
  return response;
}

/** An upload's original: a PDF or a photo as given. */
const KEPT_ORIGINAL = /^\/api\/files\/[0-9a-f-]{36}\/original$/;

/**
 * An original: the cache's if the page kept it (a handy paper's PDF; asked to
 * download it or not), else the network's, not kept: originals can be large,
 * and only the handy ones are worth the room.
 */
async function original(event) {
  const cache = await caches.open(FILES_CACHE);
  const kept = await cache.match(event.request, { ignoreSearch: true });
  return kept ?? fetch(event.request);
}

/** One of the build's files, or a public one: the cache's, else the network's, kept if it's the build's. */
async function file(request) {
  const cache = await caches.open(appCache);
  const kept = await cache.match(request);
  if (kept) return kept;
  const response = await fetch(request);
  if (response.ok && new URL(request.url).pathname.startsWith("/assets/")) await cache.put(request, response.clone());
  return response;
}

/**
 * The network's answer, put in `cacheName` under `key` when `keep` says so;
 * the cache's if the network fails, or takes longer than PATIENCE_MS and the
 * cache has one. With nothing kept, the network's answer or its failure.
 */
async function networkFirst(event, cacheName, key, keep) {
  const cache = await caches.open(cacheName);
  const network = fetch(event.request).then(async (response) => {
    if (keep(response)) await cache.put(key, response.clone());
    return response;
  });
  // Let a slow answer finish and refresh the cache after the kept one has been shown.
  event.waitUntil(network.catch(() => {}));
  const slow = new Promise((resolve) => setTimeout(resolve, PATIENCE_MS)).then(() => cache.match(key));
  try {
    const first = await Promise.race([network, slow]);
    if (first) return first;
    return await network;
  } catch (failure) {
    const kept = await cache.match(key);
    if (kept) return kept;
    throw failure;
  }
}
