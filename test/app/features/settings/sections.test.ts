import { expect, test } from "vitest";
import { GROUPS } from "../../../../src/app/features/settings/model/facts";
import { isSection, SECTION_ORDER, sectionOf } from "../../../../src/app/features/settings/model/sections";
import { asksFor } from "../../../../src/lib/facts";

test("the question groups first, then the extras, something has happened, Claude, appearance and account", () => {
  expect(SECTION_ORDER).toEqual([...Object.keys(GROUPS), "extras", "quiet", "claude", "appearance", "account"]);
  expect(isSection("work")).toBe(true);
  expect(isSection("toString")).toBe(false);
});

test("an ?ask= opens on the section that has it", () => {
  const work = asksFor({}).find((a) => a.question.group === "work");
  expect(work).toBeDefined();
  expect(sectionOf(work?.key)).toBe("work");
  expect(sectionOf("dueDate")).toBe("pregnancy");
  expect(sectionOf("extra:babymoon")).toBe("extras");
  expect(sectionOf("quiet")).toBe("quiet");
  expect(sectionOf(undefined)).toBe("pregnancy");
  expect(sectionOf("nothing-like-it")).toBe("pregnancy");
});
