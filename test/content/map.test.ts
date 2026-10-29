import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { parseMap } from "../../src/content/map";

const dir = join(__dirname, "../../content/map");
const files = Object.fromEntries(
  readdirSync(dir)
    .filter((f) => f.endsWith(".yaml"))
    .map((f) => [f, readFileSync(join(dir, f), "utf8")])
);

describe("the Library's map", () => {
  const entries = parseMap(files);

  test("every entry is well formed", () => {
    // parseMap throws on the first that isn't.
    expect(entries.length).toBeGreaterThanOrEqual(0);
  });

  test("ids are unique across every file", () => {
    const seen = new Map<string, string>();
    const repeats = entries.filter((e) => seen.has(e.id) || !seen.set(e.id, e.file)).map((e) => `${e.id} (${seen.get(e.id)}, ${e.file})`);
    expect(repeats).toEqual([]);
  });

  test("related names an entry in the map, or an item that is already written", () => {
    const items = readdirSync(join(__dirname, "../../content/items")).map((f) => f.replace(/\.md$/, ""));
    const ids = new Set([...entries.map((e) => e.id), ...items]);
    const dangling = entries.flatMap((e) => e.related.filter((r) => !ids.has(r)).map((r) => `${e.id} → ${r}`));
    expect(dangling).toEqual([]);
  });

  test("exists names an item that is there", () => {
    const missing = entries.filter((e) => e.exists && !existsSync(join(__dirname, "../..", e.exists))).map((e) => `${e.id}: ${e.exists}`);
    expect(missing).toEqual([]);
  });
});
