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

  test("a preconception item has no weeks", () => {
    expect(parseItem("x.md", item("id: x\ntitle: X\nphase: preconception\ncategory: money")).from).toEqual({ phase: "preconception" });
    expect(() => parseItem("x.md", item("id: x\ntitle: X\nphase: preconception\nweeks: 3\ncategory: money"))).toThrow(
      /weeks: a preconception item has no weeks/
    );
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
    ["bad category", item("id: x\ntitle: X\nphase: preconception\ncategory: shopping"), /category/],
    ["bad id", item("id: Not A Slug\ntitle: X\nphase: preconception\ncategory: body"), /lower-case/],
    ["empty body", item("id: x\ntitle: X\nphase: preconception\ncategory: body", ""), /body is empty/],
    ["a when on no question", item(`${rsv}\nwhen: { mood: happy }`), /"mood" is not a question/],
    ["a when on no answer", item(`${rsv}\nwhen: { cover: maybe }`), /"maybe" is not an answer to cover/],
    ["an unknown tag", item(rsv, "{% video /%}"), /video/],
    ["a tag missing its attribute", item(rsv, "{% ask /%}"), /primary/],
    ["an unknown question in the body", item(rsv, '{% if equals($mood, "happy") %}\nHi\n{% /if %}'), /\$mood is not a question/],
    ["an unknown answer in the body", item(rsv, '{% if equals($cover, "maybe") %}\nHi\n{% /if %}'), /"maybe" is not an answer to \$cover/],
    ["a window backwards", item(rsv, "{% window from=36 to=28 /%}"), /window weeks must run forwards/],
  ])("rejects %s, naming the file", (_name, source, message) => {
    expect(() => parseItem("bad.md", source)).toThrow(ContentError);
    expect(() => parseItem("bad.md", source)).toThrow(message);
    expect(() => parseItem("bad.md", source)).toThrow(/^bad\.md: /);
  });
});

describe("tailoring", () => {
  test("when takes one answer or a list", () => {
    expect(parseItem("x.md", item(`${rsv}\nwhen: { cover: "no", state: [vic, nsw] }`)).when).toEqual({ cover: ["no"], state: ["vic", "nsw"] });
    expect(parseItem("x.md", item(rsv)).when).toEqual({});
  });

  test("a body may use the tags and the household's answers", () => {
    const body = '{% window from=28 to=36 /%}\n\n{% if equals($cover, "yes") %}\nPrivate.\n{% else /%}\nPublic.\n{% /if %}\n\n{% ask "Is it free?" /%}';
    expect(() => parseItem("x.md", item(rsv, body))).not.toThrow();
  });
});

test("ids are unique across items and tasks", () => {
  const a = item("id: a\ntitle: A\nphase: preconception\ncategory: body\ntasks:\n  - id: b\n    title: T");
  const b = item("id: b\ntitle: B\nphase: preconception\ncategory: body");
  expect(() => parseAll({ "a.md": a, "b.md": b })).toThrow(/id "b" is also used by a/);
});
