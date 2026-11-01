import { describe, expect, test } from "vitest";
import { builtInItems, dayReads } from "../../src/content";
import { parseDay, readsOut } from "../../src/content/days";
import { ContentError } from "../../src/content/file";
import { unasked } from "../../src/lib/library";

const day = (frontmatter = "title: The scan\nread: [morphology-scan]", body = "It looks at everything.") => `---\n${frontmatter}\n---\n${body}\n`;

describe("parseDay", () => {
  test("a read", () => {
    const read = parseDay("../../content/days/20/3.md", day());
    expect(read).toMatchObject({ week: 20, day: 3, title: "The scan", read: ["morphology-scan"] });
    expect(read.body.children.map((n) => n.type)).toEqual(["paragraph"]);
  });

  test("named for its week and day, +1 to +6", () => {
    for (const file of ["days/20/0.md", "days/20/7.md", "days/43/1.md", "days/06/1.md", "days/20/01.md", "days/20.md", "days/x/1.md"]) {
      expect(() => parseDay(file, day()), file).toThrow(ContentError);
    }
  });

  test("names at least one entry, and links to none in its body", () => {
    expect(() => parseDay("days/20/1.md", day("title: The scan"))).toThrow(/read/);
    expect(() => parseDay("days/20/1.md", day("title: The scan\nread: []"))).toThrow(ContentError);
    expect(() => parseDay("days/20/1.md", day(undefined, "See [the scan](morphology-scan)."))).toThrow(/no links/);
  });

  test("has something to say", () => {
    expect(() => parseDay("days/20/1.md", day(undefined, ""))).toThrow(/empty/);
  });
});

describe("readsOut", () => {
  const reads = [1, 2, 3, 4, 5, 6].flatMap((d) => [parseDay(`days/19/${d}.md`, day()), parseDay(`days/20/${d}.md`, day())]);

  test("the week's own, up to today", () => {
    expect(readsOut(reads, 19, 19 * 7 + 4).map((r) => `${r.week}+${r.day}`)).toEqual(["19+1", "19+2", "19+3", "19+4"]);
    expect(readsOut(reads, 19, 19 * 7)).toEqual([]);
  });

  test("all of a week gone, none of one to come", () => {
    expect(readsOut(reads, 19, 20 * 7 + 2)).toHaveLength(6);
    expect(readsOut(reads, 20, 19 * 7 + 2)).toEqual([]);
  });
});

describe("the built-in reads", () => {
  const items = new Map(builtInItems.map((i) => [i.id, i]));

  test("each opens onto entries that exist, may come unasked, and aren't an extra's", () => {
    for (const read of dayReads) {
      for (const id of read.read) {
        const item = items.get(id);
        const where = `days/${read.week}/${read.day}.md: ${id}`;
        expect(item, where).toBeDefined();
        expect(unasked(item!), `${where} is private or a hard topic`).toBe(true);
        expect(item!.extra, `${where} belongs to an extra`).toBeNull();
      }
    }
  });
});
