import { describe, expect, it } from "vitest";
import { PILLARS, TABS } from "../../src/app/components/layout/pillars";

describe("the pillars", () => {
  it("are the same in the tab bar as in the sidebar, only reordered", () => {
    expect(TABS).toHaveLength(PILLARS.length);
    expect(new Set(TABS)).toEqual(new Set(PILLARS));
  });

  it("put home first in the sidebar and in the middle of the tab bar", () => {
    expect(PILLARS[0]?.to).toBe("/");
    expect(TABS[Math.floor(TABS.length / 2)]?.to).toBe("/");
  });
});
