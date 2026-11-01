import { expect, test } from "vitest";
import { CARD_SIZE, cells, deal, FREE, LINES, moments, SQUARES, standing, standingLine } from "../../src/lib/bingo";

const card = deal(() => 0.5);
const mark = (squareId: string, day: string) => ({ squareId, day: day as never, note: null, markedAt: `${day}T00:00:00.000Z` });

test("enough squares, none twice, each short enough for its place", () => {
  expect(SQUARES.length).toBeGreaterThanOrEqual(CARD_SIZE * 2);
  expect(new Set(SQUARES.map((s) => s.id)).size).toBe(SQUARES.length);
  for (const s of SQUARES) expect(s.text.length).toBeLessThanOrEqual(56);
});

test("a card is 24 different squares around the free centre; 12 lines", () => {
  expect(new Set(card).size).toBe(CARD_SIZE);
  expect(cells(card)[FREE]).toBeNull();
  expect(cells(card)).toHaveLength(25);
  expect(LINES).toHaveLength(12);
  expect(deal()).not.toEqual(deal());
});

test("nothing marked: the middle row is four away, as the centre's free", () => {
  expect(standing({ squares: card, marks: [] })).toMatchObject({ marked: 0, lines: [], closest: 4, full: false, bingoOn: null });
});

test("the middle row is bingo with four marks, on the day the last came; one away before it", () => {
  const row = cells(card)
    .slice(10, 15)
    .filter((id): id is string => id !== null);
  const three = row.slice(0, 3).map((id, i) => mark(id, `2026-11-0${i + 1}`));
  expect(standing({ squares: card, marks: three }).closest).toBe(1);
  expect(standingLine(standing({ squares: card, marks: three }))).toBe("3 marked, one away");
  const s = standing({ squares: card, marks: [...three, mark(row[3]!, "2026-11-09")] });
  expect(s.lines).toEqual([[10, 11, 12, 13, 14]]);
  expect(s.bingoOn).toBe("2026-11-09");
  expect(standingLine(s)).toBe("Bingo! 4 marked");
});

test("a full house on the day of its last mark; the Journal's moments for each card", () => {
  const all = card.map((id, i) => mark(id, `2026-12-${String(i + 1).padStart(2, "0")}`));
  const s = standing({ squares: card, marks: all });
  expect(s).toMatchObject({ full: true, fullOn: "2026-12-24", marked: 24 });
  expect(standingLine(s)).toBe("Full house!");
  expect(moments([{ personId: "sam", squares: card, dealtAt: "", marks: all }]).map((m) => [m.kind, m.day])).toEqual([
    ["bingo", s.bingoOn],
    ["full", "2026-12-24"],
  ]);
});
