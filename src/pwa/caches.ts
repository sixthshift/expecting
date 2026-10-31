// The service worker's four caches (src/pwa/worker.js), named here so the app
// can forget what it keeps. The app's name carries the build's version.

/** The shell and the build's files, a cache per build. */
export const APP_CACHE = "expecting-app";

/** Each server function's last answer. */
export const DATA_CACHE = "expecting-data";

/** Uploads' thumbnails and display copies, kept as they're first drawn. An upload never changes, so it outlives a new build. */
export const FILES_CACHE = "expecting-files";

/** What was last shared into Expecting from another app, kept by the worker until the page takes it (src/pwa/share.ts). */
export const SHARED_CACHE = "expecting-shared";
