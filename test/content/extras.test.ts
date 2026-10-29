import { describe, expect, test } from "vitest";
import { builtInItems } from "../../src/content";
import { EXTRAS, parseExtras } from "../../src/content/extras";
import { parseItem } from "../../src/content/parse";

describe("content/extras.yaml", () => {
  test("loads, and every extra has something in it", () => {
    expect(EXTRAS.length).toBeGreaterThan(0);
    for (const e of EXTRAS)
      expect(
        builtInItems.filter((i) => i.extra === e.id),
        e.id
      ).not.toHaveLength(0);
  });

  test.each([
    ["a repeated id", "- { id: a, name: A, pitch: P, group: money, offer: 4 }\n- { id: a, name: B, pitch: P, group: money, offer: 4 }", /appears twice/],
    ["an id items can't name", "- { id: Baby_Shower, name: A, pitch: P, group: money, offer: 4 }", /hyphens/],
    ["an offer past the pregnancy", "- { id: a, name: A, pitch: P, group: money, offer: 43 }", /42/],
  ])("rejects %s", (_name, text, message) => {
    expect(() => parseExtras(text)).toThrow(message);
  });

  test("an item names an extra that exists", () => {
    const item = (extra: string) => `---\nid: x\ntitle: X\nweeks: 20\ntype: moment\ntopic: celebrations\nextra: ${extra}\n---\nBody.\n`;
    expect(parseItem("items/x.md", item("baby-shower")).extra).toBe("baby-shower");
    expect(() => parseItem("items/x.md", item("pony"))).toThrow(/not an extra/);
  });
});
