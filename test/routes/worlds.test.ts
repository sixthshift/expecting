import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { describe, expect, it } from "vitest";

// Quiet is a mirror world of each pillar, and the route's file is the one
// place that says which page each world draws (`worlds`). Read as text: every
// route whose page has a twin under `quiet/pages/` draws both through
// `worlds(`, every quiet page is some route's, and no normal page reaches for
// its twin itself.
const root = join(import.meta.dirname, "..", "..");
const src = join(root, "src");

function filesUnder(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? filesUnder(join(dir, e.name)) : [join(dir, e.name)]));
}

// Every route is in a routes/ folder: src/routes/, or a pillar's or a feature's.
const routeFiles = filesUnder(src).filter((f) => /\/routes\/[^/]+\.tsx?$/.test(f));
const lazyPages = routeFiles.flatMap((file) => {
  const text = readFileSync(file, "utf8");
  return [...text.matchAll(/import\("([^"]+)"\)/g)].map((m) => ({ file, text, page: join(dirname(file), m[1] as string) }));
});

/** A page's twin: `…/pages/XPage` → `…/quiet/pages/QuietXPage`. */
function twinOf(page: string): string {
  return join(dirname(dirname(page)), "quiet", "pages", `Quiet${basename(page)}`);
}

const twinned = lazyPages.filter(({ page }) => !page.includes("/quiet/") && existsSync(`${twinOf(page)}.tsx`));

describe("worlds", () => {
  it("finds the mirrored pages", () => {
    expect(twinned.map(({ page }) => basename(page)).sort()).toEqual(
      ["BookPage", "ItsTimePage", "JournalPage", "LibraryPage", "PlannerPage", "ThisWeekPage", "TimelinePage"].sort()
    );
  });

  it.each(twinned.map((t) => [relative(src, t.file), t] as const))("%s draws both worlds through worlds()", (_, { file, text, page }) => {
    const twin = relative(dirname(file), twinOf(page));
    expect(text).toContain("worlds(");
    expect(text).toContain(`import("${twin.startsWith("..") ? twin : `./${twin}`}")`);
  });

  it("every quiet page is a route's", () => {
    const quietPages = filesUnder(src).filter((f) => /\/quiet\/pages\/Quiet\w+Page\.tsx$/.test(f));
    const drawn = new Set(lazyPages.map(({ page }) => `${page}.tsx`));
    expect(quietPages.filter((f) => !drawn.has(f)).map((f) => relative(src, f))).toEqual([]);
  });

  it("no normal page chooses its world", () => {
    for (const { page } of twinned) {
      const text = readFileSync(`${page}.tsx`, "utf8");
      expect(text, relative(src, page)).not.toMatch(/quiet\/pages\/|useQuietQuery|useQuietKind/);
    }
  });
});
