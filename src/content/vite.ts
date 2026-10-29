// The built-in items as the bundle reads them, split by src/content/file.ts:
//
//   virtual:expecting/items   every item's index half, one module, YAML parsed
//                             here so the phone only parses JSON
//   content/items/<id>.md?page   one item's page half, its own chunk, loaded
//                             when its page opens
//
// Some 900 files, read eagerly whole, were 2 MB in the main bundle and a
// second's parse on a phone; their indexes are a fraction of that. Checking is
// still src/content/: the index is checked as it loads, and every page, in
// full, by test/content/.

import { readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import type { Plugin } from "vite";
import { splitItem } from "./file.ts";

const INDEX = "virtual:expecting/items";
const RESOLVED = `\0${INDEX}`;

export function contentPlugin(): Plugin {
  let dir = "";
  return {
    name: "expecting:content",
    configResolved(config) {
      dir = join(config.root, "content/items");
    },
    resolveId(id) {
      return id === INDEX ? RESOLVED : null;
    },
    load(id) {
      if (id === RESOLVED) {
        const files = readdirSync(dir)
          .filter((f) => f.endsWith(".md"))
          .sort();
        const halves = files.map((f) => {
          const path = join(dir, f);
          this.addWatchFile(path);
          return splitItem(`items/${f}`, readFileSync(path, "utf8")).index;
        });
        // A JSON string parses faster than the same object as a literal.
        return `export default JSON.parse(${JSON.stringify(JSON.stringify(halves))});`;
      }
      const [path, query] = id.split("?");
      if (query !== "page" || !path?.endsWith(".md")) return null;
      this.addWatchFile(path);
      return `export default ${JSON.stringify(splitItem(`items/${basename(path)}`, readFileSync(path, "utf8")).page)};`;
    },
    configureServer(server) {
      // A file added or removed changes the index; an edit is already watched.
      const reload = (file: string) => {
        if (dirname(file) !== dir || !file.endsWith(".md")) return;
        for (const env of Object.values(server.environments)) {
          const mod = env.moduleGraph.getModuleById(RESOLVED);
          if (mod) env.moduleGraph.invalidateModule(mod);
        }
        server.ws.send({ type: "full-reload" });
      };
      server.watcher.add(dir);
      server.watcher.on("add", reload);
      server.watcher.on("unlink", reload);
    },
  };
}
