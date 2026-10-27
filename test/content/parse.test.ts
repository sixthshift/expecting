import { describe, expect, test } from "vitest";
import { ContentError, parseAll, parseItem } from "../../src/content/parse";

const item = (frontmatter: string, body = "Some words.") => `---\n${frontmatter}\n---\n${body}\n`;

// An item's folder is its phase and its file name its id: `pregnancy/rsv-vaccine.md`.
const RSV = "pregnancy/rsv-vaccine.md";
const rsv = `id: rsv-vaccine
title: The RSV vaccine
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
    const parsed = parseItem(RSV, item(rsv));
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

  test("the folder is the phase, however the path starts", () => {
    expect(parseItem("postpartum/x.md", item("id: x\ntitle: X\nweeks: 6\ncategory: baby")).from).toEqual({ phase: "postpartum", week: 6 });
    expect(parseItem("../../content/pregnancy/x.md", item("id: x\ntitle: X\nweeks: 6\ncategory: baby")).from).toEqual({ phase: "pregnancy", week: 6 });
  });

  test("a single week and an explicit due", () => {
    const parsed = parseItem("postpartum/x.md", item("id: x\ntitle: X\nweeks: 6\ncategory: baby\ntasks:\n  - id: t\n    title: T\n    due: 6"));
    expect(parsed.from).toEqual({ phase: "postpartum", week: 6 });
    expect(parsed.tasks[0]!.due).toEqual({ phase: "postpartum", week: 6 });
  });

  test("a preconception item has no weeks", () => {
    expect(parseItem("preconception/x.md", item("id: x\ntitle: X\ncategory: money")).from).toEqual({ phase: "preconception" });
    expect(() => parseItem("preconception/x.md", item("id: x\ntitle: X\nweeks: 3\ncategory: money"))).toThrow(/weeks: a preconception item has no weeks/);
  });

  test.each([
    ["no frontmatter", "pregnancy/x.md", "just text", /no frontmatter/],
    ["bad yaml", "pregnancy/x.md", item("id: [unclosed"), /not YAML/],
    ["unknown field", RSV, item(`${rsv}\nmood: happy`), /mood|Unrecognized/],
    ["weeks backwards", "pregnancy/x.md", item("id: x\ntitle: X\nweeks: [30, 20]\ncategory: body"), /weeks must run forwards/],
    ["weeks out of range", "postpartum/x.md", item("id: x\ntitle: X\nweeks: [1, 20]\ncategory: body"), /within 1–12/],
    [
      "a task due outside its item",
      "pregnancy/x.md",
      item("id: x\ntitle: X\nweeks: [18, 20]\ncategory: body\ntasks:\n  - id: t\n    title: T\n    due: 16"),
      /within the item's weeks, 18–20/,
    ],
    ["missing weeks", "pregnancy/x.md", item("id: x\ntitle: X\ncategory: body"), /needs weeks/],
    ["bad category", "preconception/x.md", item("id: x\ntitle: X\ncategory: shopping"), /category/],
    ["bad id", "preconception/x.md", item("id: Not A Slug\ntitle: X\ncategory: body"), /lower-case/],
    ["empty body", "preconception/x.md", item("id: x\ntitle: X\ncategory: body", ""), /body is empty/],
    ["a phase in the frontmatter", "pregnancy/x.md", item("id: x\ntitle: X\nphase: pregnancy\nweeks: 6\ncategory: body"), /no phase: in the frontmatter/],
    ["a file outside a phase's folder", "x.md", item("id: x\ntitle: X\nweeks: 6\ncategory: body"), /belongs in a phase's folder/],
    ["a folder that is no phase", "birth/x.md", item("id: x\ntitle: X\nweeks: 6\ncategory: body"), /belongs in a phase's folder/],
    ["an id that isn't the file's name", "pregnancy/y.md", item("id: x\ntitle: X\nweeks: 6\ncategory: body"), /id "x" must be the file's name, y/],
    ["a when on no question", RSV, item(`${rsv}\nwhen: { mood: happy }`), /"mood" is not a question/],
    ["a when on no answer", RSV, item(`${rsv}\nwhen: { cover: maybe }`), /"maybe" is not an answer to cover/],
    ["an unknown tag", RSV, item(rsv, "{% video /%}"), /video/],
    ["a tag missing its attribute", RSV, item(rsv, "{% ask /%}"), /primary/],
    ["an unknown question in the body", RSV, item(rsv, '{% if equals($mood, "happy") %}\nHi\n{% /if %}'), /\$mood is not a question/],
    ["an unknown answer in the body", RSV, item(rsv, '{% if equals($cover, "maybe") %}\nHi\n{% /if %}'), /"maybe" is not an answer to \$cover/],
    ["a window backwards", RSV, item(rsv, "{% window from=36 to=28 /%}"), /window weeks must run forwards/],
  ])("rejects %s, naming the file", (_name, file, source, message) => {
    expect(() => parseItem(file, source)).toThrow(ContentError);
    expect(() => parseItem(file, source)).toThrow(message);
    expect(() => parseItem(file, source)).toThrow(`${file}: `);
  });
});

describe("tailoring", () => {
  test("when takes one answer or a list", () => {
    expect(parseItem(RSV, item(`${rsv}\nwhen: { cover: "no", state: [vic, nsw] }`)).when).toEqual({ cover: ["no"], state: ["vic", "nsw"] });
    expect(parseItem(RSV, item(rsv)).when).toEqual({});
  });

  test("a body may use the tags and the household's answers", () => {
    const body = '{% window from=28 to=36 /%}\n\n{% if equals($cover, "yes") %}\nPrivate.\n{% else /%}\nPublic.\n{% /if %}\n\n{% ask "Is it free?" /%}';
    expect(() => parseItem(RSV, item(rsv, body))).not.toThrow();
  });
});

test("ids are unique across items and tasks", () => {
  const a = item("id: a\ntitle: A\ncategory: body\ntasks:\n  - id: b\n    title: T");
  const b = item("id: b\ntitle: B\ncategory: body");
  expect(() => parseAll({ "preconception/a.md": a, "preconception/b.md": b })).toThrow(/id "b" is also used by a/);
});
