// The version in package.json and the commit it was built from, inlined at
// build time by vite.config.ts's `define`. The bump is the release workflow's
// (scripts/version.ts); the commit is EXPECTING_COMMIT when the build is handed
// one (the image is built without .git), else what git says, else empty.
// Outside a vite build — a bare `bun run` of a CLI — the constants are absent
// and the fallbacks say so.
declare const __EXPECTING_VERSION__: string | undefined;
declare const __EXPECTING_COMMIT__: string | undefined;

export const VERSION: string = typeof __EXPECTING_VERSION__ === "string" ? __EXPECTING_VERSION__ : "0.0.0-dev";

/** The short commit hash this build came from, or "" when the build was not told one. */
export const COMMIT: string = typeof __EXPECTING_COMMIT__ === "string" ? __EXPECTING_COMMIT__ : "";
