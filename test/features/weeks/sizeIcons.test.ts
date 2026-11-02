import { expect, test } from "vitest";
import { weekNotes } from "../../../src/content";
import { SIZE_ICONS } from "../../../src/features/weeks/model/sizeIcons";

test("every week's size has its drawing, and every drawing a week", () => {
  const likes = new Set(weekNotes.flatMap((n) => (n.size?.like ? [n.size.like] : [])));
  expect([...likes].filter((like) => !SIZE_ICONS[like])).toEqual([]);
  expect(Object.keys(SIZE_ICONS).filter((like) => !likes.has(like))).toEqual([]);
});
