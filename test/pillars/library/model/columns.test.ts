import { describe, expect, it } from "vitest";
import { columnsIn, intoColumns } from "../../../../src/pillars/library/model/columns";

const group = (key: string, n: number) => ({ key, title: key, items: Array.from({ length: n }, (_, i) => `${key}${i}`) });
const shape = (columns: ReturnType<typeof intoColumns<string>>) =>
  columns.map((c) => c.map((p) => `${p.first ? "" : "…"}${p.key.split(":")[0]}${p.items.length}`));

describe("columnsIn", () => {
  it("fits as many as the width holds, at least one", () => {
    expect(columnsIn(320, 320, 24)).toBe(1);
    expect(columnsIn(663, 320, 24)).toBe(1);
    expect(columnsIn(664, 320, 24)).toBe(2);
    expect(columnsIn(1088, 320, 24)).toBe(3);
    expect(columnsIn(200, 320, 24)).toBe(1);
  });
});

describe("intoColumns", () => {
  it("keeps everything in one column when there's one", () => {
    expect(shape(intoColumns([group("a", 5), group("b", 3)], 1))).toEqual([["a5", "b3"]]);
  });

  it("runs one group on across the columns, evenly", () => {
    expect(shape(intoColumns([group("a", 51)], 3))).toEqual([["a17"], ["…a17"], ["…a17"]]);
  });

  it("keeps every row, in order", () => {
    const groups = [group("a", 10), group("b", 10), group("c", 3)];
    const parts = intoColumns(groups, 3).flat();
    expect(parts.flatMap((p) => p.items)).toEqual(groups.flatMap((g) => g.items));
    expect(parts.filter((p) => p.first).map((p) => p.title)).toEqual(["a", "b", "c"]);
  });

  it("never leaves a row on its own either side of a break", () => {
    for (let n = 2; n < 40; n++) {
      for (const count of [2, 3]) {
        const parts = intoColumns([group("a", n), group("b", 4)], count).flat();
        const broken = parts.filter((p) => !p.first || parts.some((q) => q.key !== p.key && q.title === p.title));
        for (const p of broken) expect(p.items.length, `${n} in ${count}`).toBeGreaterThan(1);
      }
    }
  });

  it("uses no more columns than it's given", () => {
    expect(intoColumns([group("a", 3), group("b", 3), group("c", 3), group("d", 3)], 2).length).toBeLessThanOrEqual(2);
  });
});
