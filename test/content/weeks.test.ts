import { describe, expect, test } from "vitest";
import { weekNotes } from "../../src/content";
import { ContentError } from "../../src/content/parse";
import { parseWeek, SECTIONS, sizeLabel } from "../../src/content/weeks";

const BODY = "## The baby\n\nGrowing.\n\n## Your body\n\nTired.\n\n## For the partner\n\nCook.";
const note = (frontmatter = "title: Halfway", body = BODY) => `---\n${frontmatter}\n---\n${body}\n`;

describe("parseWeek", () => {
  test("a full note", () => {
    const parsed = parseWeek(
      "weeks/20.md",
      note(
        "title: Halfway\nsize:\n  length: 16\n  weight: 320\n  like: a banana\nsource:\n  title: A source\n  url: https://example.org/20\nchecked: 2026-10-28"
      )
    );
    expect(parsed).toMatchObject({
      key: "20",
      slot: { phase: "pregnancy", week: 20 },
      title: "Halfway",
      size: { length: 16, weight: 320, like: "a banana" },
      draft: true,
      source: { title: "A source", url: "https://example.org/20" },
      checked: "2026-10-28",
    });
    expect(Object.keys(parsed.sections)).toEqual(Object.keys(SECTIONS));
    expect(parsed.sections.body.children.map((n) => n.type)).toEqual(["paragraph"]);
  });

  test("the file's name is its week, however the path starts", () => {
    expect(parseWeek("../../content/weeks/pp3.md", note()).slot).toEqual({ phase: "postpartum", week: 3 });
    for (const file of ["weeks/06.md", "weeks/43.md", "weeks/pp13.md", "weeks/preconception.md", "weeks/halfway.md"]) {
      expect(() => parseWeek(file, note()), file).toThrow(ContentError);
    }
  });

  test("the three parts, in order, each with something in it", () => {
    const parts = (...headings: string[]) => headings.map((h) => `${h}\n\nWords.`).join("\n\n");
    expect(() => parseWeek("weeks/20.md", note(undefined, parts("## The baby", "## For the partner", "## Your body")))).toThrow(/in that order/);
    expect(() => parseWeek("weeks/20.md", note(undefined, parts("## The baby", "## Your body")))).toThrow(/3 parts/);
    expect(() => parseWeek("weeks/20.md", note(undefined, parts("## The baby", "### Your body", "## For the partner")))).toThrow(/in that order/);
    expect(() => parseWeek("weeks/20.md", note(undefined, `Before.\n\n${BODY}`))).toThrow(/starts with/);
    expect(() => parseWeek("weeks/20.md", note(undefined, "## The baby\n\n## Your body\n\nTired.\n\n## For the partner\n\nCook."))).toThrow(
      /"The baby" is empty/
    );
  });

  test("a part is checked like an item's body", () => {
    expect(() => parseWeek("weeks/20.md", note(undefined, BODY.replace("Tired.", '{% if equals($cover, "maybe") %}Tired.{% /if %}')))).toThrow(/not an answer/);
  });

  test("the frontmatter is strict", () => {
    expect(() => parseWeek("weeks/20.md", note("title: Halfway\nweeks: 20"))).toThrow(/weeks/);
    expect(() => parseWeek("weeks/20.md", note("size:\n  length: 16"))).toThrow(/title/);
    expect(() => parseWeek("weeks/20.md", note("title: Halfway\nsize:\n  weight: 320"))).toThrow(/length/);
  });
});

describe("sizeLabel", () => {
  test("millimetres while tiny, kilograms once heavy", () => {
    expect(sizeLabel({ length: 0.5, weight: null, like: "a lentil" })).toBe("about 5 mm from head to bottom: about the size of a lentil");
    expect(sizeLabel({ length: 16, weight: 320, like: null })).toBe("about 16 cm from head to bottom and about 320 g");
    expect(sizeLabel({ length: 25, weight: 1000, like: "an eggplant" })).toBe("about 25 cm from head to bottom and about 1 kg: about the size of an eggplant");
    expect(sizeLabel({ length: 33.4, weight: 1460, like: null })).toBe("about 33.4 cm from head to bottom and about 1.5 kg");
  });
});

test("every note in content/weeks/ is valid, one per week", () => {
  expect(weekNotes.length).toBeGreaterThan(0);
  const keys = weekNotes.map((n) => n.key);
  expect(new Set(keys).size).toBe(keys.length);
});
