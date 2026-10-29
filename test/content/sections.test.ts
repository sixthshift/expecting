import Markdoc from "@markdoc/markdoc";
import { expect, test } from "vitest";
import { sectionsOf } from "../../src/content/sections";

test("a body cut at its ## headings, what comes first untitled, deeper headings kept inside", () => {
  const doc = Markdoc.parse("Opening.\n\n## What's usual\n\nOften.\n\n### More\n\nDetail.\n\n## Call 000 or go to emergency\n\nNow.");
  const sections = sectionsOf(doc);
  expect(sections.map((s) => s.title)).toEqual([null, "What's usual", "Call 000 or go to emergency"]);
  expect(sections[1]!.doc.children.map((n) => n.type)).toEqual(["paragraph", "heading", "paragraph"]);
});

test("no opening, no untitled section", () => {
  expect(sectionsOf(Markdoc.parse("## Why\n\nBecause.")).map((s) => s.title)).toEqual(["Why"]);
});
