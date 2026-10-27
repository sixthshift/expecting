import { describe, expect, test } from "vitest";
import { ContentError, parseAll, parseItem } from "../../src/content/parse";

const item = (frontmatter: string, body = "Some words.") => `---\n${frontmatter}\n---\n${body}\n`;

const rsv = `id: rsv-vaccine
title: The RSV vaccine
phase: pregnancy
weeks: [28, 36]
category: appointments
surprise: true
source:
  title: A source
  url: https://example.org/rsv
checked: 2026-10-27
tasks:
  - id: book-rsv-vaccine
    title: Book it`;

describe("parseItem", () => {
  test("a full item", () => {
    const parsed = parseItem("rsv.md", item(rsv));
    expect(parsed).toMatchObject({
      id: "rsv-vaccine",
      from: { phase: "pregnancy", week: 28 },
      to: { phase: "pregnancy", week: 36 },
      surprise: true,
      draft: true,
      checked: "2026-10-27",
      body: "Some words.",
    });
    expect(parsed.tasks).toEqual([
      { id: "book-rsv-vaccine", title: "Book it", due: { phase: "pregnancy", week: 36 }, itemId: "rsv-vaccine", origin: "built-in" },
    ]);
  });

  test("a single week and an explicit due", () => {
    const parsed = parseItem("x.md", item("id: x\ntitle: X\nphase: postpartum\nweeks: 6\ncategory: baby\ntasks:\n  - id: t\n    title: T\n    due: 6"));
    expect(parsed.from).toEqual({ phase: "postpartum", week: 6 });
    expect(parsed.tasks[0]!.due).toEqual({ phase: "postpartum", week: 6 });
  });

  test("a before item has no weeks", () => {
    expect(parseItem("x.md", item("id: x\ntitle: X\nphase: before\ncategory: money")).from).toEqual({ phase: "before" });
    expect(() => parseItem("x.md", item("id: x\ntitle: X\nphase: before\nweeks: 3\ncategory: money"))).toThrow(/weeks: a 'before' item has no weeks/);
  });

  test.each([
    ["no frontmatter", "just text", /no frontmatter/],
    ["bad yaml", item("id: [unclosed"), /not YAML/],
    ["unknown field", item(`${rsv}\nmood: happy`), /mood|Unrecognized/],
    ["weeks backwards", item("id: x\ntitle: X\nphase: pregnancy\nweeks: [30, 20]\ncategory: body"), /weeks must run forwards/],
    ["weeks out of range", item("id: x\ntitle: X\nphase: postpartum\nweeks: [1, 20]\ncategory: body"), /within 1–12/],
    [
      "a task due outside its item",
      item("id: x\ntitle: X\nphase: pregnancy\nweeks: [18, 20]\ncategory: body\ntasks:\n  - id: t\n    title: T\n    due: 16"),
      /within the item's weeks, 18–20/,
    ],
    ["missing weeks", item("id: x\ntitle: X\nphase: pregnancy\ncategory: body"), /needs weeks/],
    ["bad category", item("id: x\ntitle: X\nphase: before\ncategory: shopping"), /category/],
    ["bad id", item("id: Not A Slug\ntitle: X\nphase: before\ncategory: body"), /lower-case/],
    ["empty body", item("id: x\ntitle: X\nphase: before\ncategory: body", ""), /body is empty/],
  ])("rejects %s, naming the file", (_name, source, message) => {
    expect(() => parseItem("bad.md", source)).toThrow(ContentError);
    expect(() => parseItem("bad.md", source)).toThrow(message);
    expect(() => parseItem("bad.md", source)).toThrow(/^bad\.md: /);
  });
});

test("ids are unique across items and tasks", () => {
  const a = item("id: a\ntitle: A\nphase: before\ncategory: body\ntasks:\n  - id: b\n    title: T");
  const b = item("id: b\ntitle: B\nphase: before\ncategory: body");
  expect(() => parseAll({ "a.md": a, "b.md": b })).toThrow(/id "b" is also used by a/);
});
