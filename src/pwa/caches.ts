// The service worker's two caches (src/pwa/worker.js), named here so the app
// can forget what it keeps. The app's name carries the build's version.

/** The shell and the build's files, a cache per build. */
export const APP_CACHE = "expecting-app";

/** Each server function's last answer. */
export const DATA_CACHE = "expecting-data";
