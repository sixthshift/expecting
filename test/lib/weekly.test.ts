import { expect, test } from "vitest";
import { earlier, pairs, questionOf, WEEKLY_WEEKS, weekOf } from "../../src/lib/weekly";

const a = (body: string, by: string, answeredAt: string) => ({ body, by, answeredAt });

test("a question for each week from 4 to 41, none twice", () => {
  expect(WEEKLY_WEEKS[0]).toBe(4);
  expect(WEEKLY_WEEKS.at(-1)).toBe(41);
  expect(new Set(WEEKLY_WEEKS.map(questionOf)).size).toBe(WEEKLY_WEEKS.length);
});

test("the Journal has a week only once both have answered, on the day the second came", () => {
  const view = {
    weeks: [
      { week: 20 as const, mine: a("Ask Mum", "j", "2026-11-03T01:00:00Z"), theirs: a("Google", "s", "2026-11-01T01:00:00Z") },
      { week: 21 as const, mine: a("Tea", "j", "2026-11-04T01:00:00Z"), theirs: null },
    ],
  };
  expect(pairs(view, (at) => at.slice(0, 10) as never)).toEqual([
    { week: 20, question: questionOf(20), answers: [a("Google", "s", "2026-11-01T01:00:00Z"), a("Ask Mum", "j", "2026-11-03T01:00:00Z")], day: "2026-11-03" },
  ]);
  expect(weekOf(view, 22)).toEqual({ week: 22, mine: null, theirs: null });
});

test("earlier questions, newest first, only before this week", () => {
  expect(earlier(7)).toEqual([6, 5, 4]);
  expect(earlier(4)).toEqual([]);
});
