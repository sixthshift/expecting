import { describe, expect, test } from "vitest";
import { builtInItems } from "../../../../src/content";
import { parseItem } from "../../../../src/content/parse";
import { EXTRAS, parseExtras } from "../../../../src/features/settings/model/extras";

describe("src/features/settings/model/extras.data.ts", () => {
  test("loads, and every extra has something in it", () => {
    expect(EXTRAS.length).toBeGreaterThan(0);
    for (const e of EXTRAS)
      expect(
        builtInItems.filter((i) => i.extra === e.id),
        e.id
      ).not.toHaveLength(0);
  });

  const e = { id: "a", name: "A", pitch: "P", group: "money", offer: 4 };
  test.each([
    ["a repeated id", [e, { ...e, name: "B" }], /appears twice/],
    ["an id items can't name", [{ ...e, id: "Baby_Shower" }], /hyphens/],
    ["an offer past the pregnancy", [{ ...e, offer: 43 }], /42/],
  ])("rejects %s", (_name, list, message) => {
    expect(() => parseExtras(list)).toThrow(message);
  });

  test("an item names an extra that exists", () => {
    const item = (extra: string) => `---\nid: x\ntitle: X\nweeks: 20\ntype: moment\ntopic: celebrations\nextra: ${extra}\n---\nBody.\n`;
    expect(parseItem("items/x.md", item("baby-shower")).extra).toBe("baby-shower");
    expect(() => parseItem("items/x.md", item("pony"))).toThrow(/not an extra/);
  });
});
