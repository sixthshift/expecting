// Emits the service worker, /sw.js, from src/pwa/worker.js with the build's
// own files written in above it: CORE (the app, fetched as the worker
// installs), PAGES (the items' pages, a chunk each, fetched after) and a
// VERSION named for them all, so every build that changes a file is a new
// worker. Only the client build; dev has no worker (src/pwa/register.ts).

import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import type { Plugin } from "vite";
import { APP_CACHE, DATA_CACHE } from "./caches.ts";

/** Where the worker is served: at the root, so every path is in its scope. */
export const WORKER_FILE = "sw.js";

/** An item's page chunk, as src/content/vite.ts makes it. */
const ITEM_PAGE = /\/content\/items\/[^/]+\.md\?page$/;

export type Built = { fileName: string; facadeModuleId?: string | null };

/** What the worker fetches, by URL path: the app up front, the items' pages after. Source maps and Vite's own dotfiles are left out. */
export function precache(built: Built[], publicFiles: string[]): { core: string[]; pages: string[] } {
  const core: string[] = [];
  const pages: string[] = [];
  for (const file of built) {
    if (file.fileName.endsWith(".map") || file.fileName.startsWith(".")) continue;
    (file.facadeModuleId && ITEM_PAGE.test(file.facadeModuleId) ? pages : core).push(`/${file.fileName}`);
  }
  for (const file of publicFiles) if (file !== WORKER_FILE && !file.startsWith(".")) core.push(`/${file}`);
  return { core: core.sort(), pages: pages.sort() };
}

/** The worker: its source, with the build's files and caches declared above it. */
export function workerSource(source: string, files: { core: string[]; pages: string[] }): string {
  const version = createHash("sha256").update(source).update(JSON.stringify(files)).digest("hex").slice(0, 12);
  const declared = { VERSION: version, CORE: files.core, PAGES: files.pages, APP_CACHE, DATA_CACHE };
  const prelude = Object.entries(declared)
    .map(([name, value]) => `const ${name} = ${JSON.stringify(value)};`)
    .join("\n");
  return `${prelude}\n\n${source}`;
}

function listFiles(dir: string): string[] {
  try {
    return readdirSync(dir, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => relative(dir, join(entry.parentPath, entry.name)).split("\\").join("/"));
  } catch {
    return [];
  }
}

export function workerPlugin(): Plugin {
  let publicDir = "";
  return {
    name: "expecting:worker",
    apply: "build",
    applyToEnvironment: (environment) => environment.name === "client",
    configResolved(config) {
      publicDir = config.publicDir;
    },
    generateBundle(_options, bundle) {
      const built = Object.values(bundle).map((file) => ({ fileName: file.fileName, facadeModuleId: file.type === "chunk" ? file.facadeModuleId : null }));
      const source = readFileSync(new URL("./worker.js", import.meta.url), "utf8");
      this.emitFile({ type: "asset", fileName: WORKER_FILE, source: workerSource(source, precache(built, listFiles(publicDir))) });
    },
  };
}
