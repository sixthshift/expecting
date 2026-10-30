import { describe, expect, test } from "vitest";
import { precache, workerSource } from "../../src/pwa/vite";

describe("precache", () => {
  const built = [
    { fileName: "assets/index-abc.js", facadeModuleId: "/app/src/client.tsx" },
    { fileName: "assets/index-abc.css" },
    { fileName: "assets/zika-def.js", facadeModuleId: "/app/content/items/zika.md?page" },
    { fileName: "assets/index-abc.js.map" },
    { fileName: ".vite/manifest.json" },
  ];

  test("the app up front, the items' pages after, no maps or Vite's own files", () => {
    expect(precache(built, ["favicon.svg", "manifest.webmanifest", "sw.js"])).toEqual({
      core: ["/assets/index-abc.css", "/assets/index-abc.js", "/favicon.svg", "/manifest.webmanifest"],
      pages: ["/assets/zika-def.js"],
    });
  });
});

describe("workerSource", () => {
  const files = { core: ["/assets/a.js"], pages: ["/assets/zika.js"] };

  test("declares the build's files and caches above the source", () => {
    const source = workerSource("self.x = 1;", files);
    expect(source).toContain('const CORE = ["/assets/a.js"];');
    expect(source).toContain('const PAGES = ["/assets/zika.js"];');
    expect(source).toContain('const APP_CACHE = "expecting-app";');
    expect(source).toContain('const DATA_CACHE = "expecting-data";');
    expect(source).toContain('const FILES_CACHE = "expecting-files";');
    expect(source.endsWith("self.x = 1;")).toBe(true);
  });

  test("a new file is a new version; the same build, the same", () => {
    const version = (s: string) => /const VERSION = "(\w+)"/.exec(s)?.[1];
    const one = version(workerSource("x", files));
    expect(version(workerSource("x", files))).toBe(one);
    expect(version(workerSource("x", { ...files, core: ["/assets/b.js"] }))).not.toBe(one);
    expect(version(workerSource("y", files))).not.toBe(one);
  });
});
