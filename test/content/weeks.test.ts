import { describe, expect, test } from "vitest";
import { weekNotes } from "../../src/content";
import { ContentError } from "../../src/content/file";
import { noteFor, parseWeek, SECTIONS, sizeLabel, sizeLine } from "../../src/content/weeks";

const BODY = "## The baby\n\nGrowing.\n\n## Your body\n\nTired.\n\n## For the partner\n\nCook.";
const note = (frontmatter = "title: Halfway", body = BODY) => `---\n${frontmatter}\n---\n${body}\n`;

describe("parseWeek", () => {
  test("a full note", () => {
    const parsed = parseWeek(
      "weeks/20.md",
      note(
        "title: Halfway\nsize:\n  length: 16\n  to: heel\n  weight: 320\n  like: a banana\n  source:\n    title: Sizes\n    url: https://example.org/sizes\nsource:\n  title: A source\n  url: https://example.org/20\nchecked: 2026-10-28"
      )
    );
    expect(parsed).toMatchObject({
      week: 20,
      title: "Halfway",
      size: { length: 16, to: "heel", weight: 320, like: "a banana", source: { title: "Sizes", url: "https://example.org/sizes" } },
      source: { title: "A source", url: "https://example.org/20" },
      checked: "2026-10-28",
    });
    expect(Object.keys(parsed.sections)).toEqual(Object.keys(SECTIONS));
    expect(parsed.sections.body.children.map((n) => n.type)).toEqual(["paragraph"]);
  });

  test("a size can name its own source", () => {
    const parsed = parseWeek(
      "weeks/10.md",
      note("title: Tiny\nsize:\n  length: 3.5\n  to: bottom\n  source:\n    title: Sizes\n    url: https://example.org/sizes")
    );
    expect(parsed.size).toEqual({ length: 3.5, to: "bottom", weight: null, like: null, source: { title: "Sizes", url: "https://example.org/sizes" } });
  });

  test("the file's name is its week, however the path starts", () => {
    expect(parseWeek("../../content/weeks/3.md", note()).week).toBe(3);
    for (const file of ["weeks/06.md", "weeks/0.md", "weeks/43.md", "weeks/pp3.md", "weeks/preconception.md", "weeks/halfway.md"]) {
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
  });
});

describe("sizeLabel", () => {
  test("millimetres while tiny, kilograms once heavy, to the bottom or the heel", () => {
    expect(sizeLabel({ length: 0.5, to: "bottom", weight: null, like: "a lentil" })).toBe("about 5 mm from head to bottom: about the size of a lentil");
    expect(sizeLabel({ length: 6.7, to: "bottom", weight: 73, like: null })).toBe("about 6.7 cm from head to bottom and about 73 g");
    expect(sizeLabel({ length: 37.6, to: "heel", weight: 1210, like: "a papaya" })).toBe(
      "about 37.6 cm from head to heel and about 1.2 kg: about the size of a papaya"
    );
    expect(sizeLabel({ length: null, to: null, weight: null, like: "a mango" })).toBe("about the size of a mango");
  });
});

describe("sizeLine", () => {
  test("a few words: what it's like, then the figures, or the size of it with none", () => {
    expect(sizeLine({ length: 0.5, to: "bottom", weight: null, like: "a lentil" })).toBe("A lentil · 5 mm");
    expect(sizeLine({ length: 37.6, to: "heel", weight: 1210, like: "a papaya" })).toBe("A papaya · 37.6 cm, 1.2 kg");
    expect(sizeLine({ length: 51.8, to: "heel", weight: 3787, like: null })).toBe("About 51.8 cm, 3.8 kg");
    expect(sizeLine({ length: null, to: null, weight: null, like: "a mango" })).toBe("The size of a mango");
  });

  test("a size says how long or what it's like; a weight only with a length; a length what it's to, and its source", () => {
    const src = "\n  source:\n    title: A\n    url: https://example.com";
    expect(() => parseWeek("weeks/20.md", note("title: Halfway\nsize:\n  like: a mango"))).not.toThrow();
    expect(() => parseWeek("weeks/20.md", note(`title: Halfway\nsize:\n  length: 25.7\n  to: heel\n  weight: 331${src}`))).not.toThrow();
    expect(() => parseWeek("weeks/20.md", note(`title: Halfway\nsize:${src}`))).toThrow(/length or what/);
    expect(() => parseWeek("weeks/20.md", note("title: Halfway\nsize:\n  weight: 320\n  like: a mango"))).toThrow(/weight only/);
    expect(() => parseWeek("weeks/20.md", note(`title: Halfway\nsize:\n  length: 25.7${src}`))).toThrow(/measured to/);
    expect(() => parseWeek("weeks/20.md", note("title: Halfway\nsize:\n  length: 25.7\n  to: heel"))).toThrow(/its source/);
  });
});

test("every note in content/weeks/ is valid, one per week", () => {
  expect(weekNotes.length).toBeGreaterThan(0);
  const weeks = weekNotes.map((n) => n.week);
  expect(new Set(weeks).size).toBe(weeks.length);
});

test("a note stays in force until the next one", () => {
  const notes = [parseWeek("weeks/12.md", note()), parseWeek("weeks/20.md", note())];
  expect(noteFor(notes, 12)?.week).toBe(12);
  expect(noteFor(notes, 19)?.week).toBe(12);
  expect(noteFor(notes, 30)?.week).toBe(20);
  expect(noteFor(notes, 11)).toBeNull();
});
