import { describe, expect, test } from "vitest";
import type { Task } from "../../src/content/schema";
import type { ISODate } from "../../src/lib/dates";
import { type Answer, factsOf, questionsDue, timeTask } from "../../src/lib/facts";
import { weekStarts } from "../../src/lib/timeline";

const dueDate: ISODate = "2027-03-01";
/** An answer given in the middle of `week`. */
function answer(key: string, value: string | null, week: number): Answer {
  const [question = "", about = "household"] = key.split(".");
  return { question, about: about as Answer["about"], value, answeredBy: null, answeredAt: `${weekStarts(week, dueDate)}T12:00:00.000Z` };
}
const due = (answers: Answer[], now: number) => questionsDue({ answers, now, dueDate }).map((a) => a.key);

describe("factsOf", () => {
  test("the latest answers, without skips, clears or answers that have gone", () => {
    expect(factsOf([answer("cover", "no", 6), answer("booked", null, 6), answer("state", "atlantis", 6)])).toEqual({ cover: "no" });
  });
});

describe("questionsDue", () => {
  test("a question comes up in its week, not before", () => {
    expect(due([], 7)).not.toContain("cover");
    expect(due([], 8)).toContain("cover");
  });

  test("a definite answer settles it", () => {
    expect(due([answer("cover", "no", 6)], 20)).not.toContain("cover");
  });

  test("not sure, or skipped, at onboarding comes back at its week", () => {
    expect(due([answer("cover", "unsure", 6)], 8)).toContain("cover");
    expect(due([answer("booked", null, 6)], 12)).toContain("booked");
  });

  test("not sure, or not now, once it's due comes back four weeks later, not every week", () => {
    const later = [answer("cover", "unsure", 9)];
    expect(due(later, 12)).not.toContain("cover");
    expect(due(later, 13)).toContain("cover");
    expect(due([answer("cover", null, 9)], 12)).not.toContain("cover");
  });

  test("a question about each of you is asked of each, and only when it fits", () => {
    const work = [answer("work.carrying", "employee", 6), answer("work.partner", "not-working", 6)];
    expect(due(work, 20).filter((k) => k.startsWith("paidLeave"))).toEqual(["paidLeave.carrying"]);
  });

  test("a question depending on another waits for it", () => {
    expect(due([answer("firstBaby", "yes", 6)], 8)).not.toContain("previousCaesarean");
    expect(due([answer("firstBaby", "no", 6)], 8)).toContain("previousCaesarean");
  });
});

describe("timeTask", () => {
  const notice: Task = {
    id: "notice",
    title: "Notice",
    opens: 24,
    due: 28,
    deadline: 30,
    deadlineFrom: { fact: "leaveStart", weeks: 10 },
    who: "together",
    itemId: "i",
    origin: "built-in",
  };

  test("without the date, the written weeks stand", () => {
    expect(timeTask(notice, {}, dueDate)).toEqual(notice);
    expect(timeTask(notice, { "leaveStart.carrying": weekStarts(36, dueDate) }, null)).toEqual(notice);
  });

  test("the deadline is counted back from the date, and best by moves up to meet it", () => {
    // Leave from week 36: notice by week 26.
    const timed = timeTask(notice, { "leaveStart.carrying": weekStarts(36, dueDate) }, dueDate);
    expect(timed).toMatchObject({ deadline: 26, due: 26, opens: 24 });
  });

  test("a later date moves the deadline later and leaves best by alone", () => {
    expect(timeTask(notice, { "leaveStart.carrying": weekStarts(41, dueDate) }, dueDate)).toMatchObject({ deadline: 31, due: 28 });
  });

  test("together, the earlier of your two dates counts; one person's task, only theirs", () => {
    const facts = { "leaveStart.carrying": weekStarts(38, dueDate), "leaveStart.partner": weekStarts(40, dueDate) };
    expect(timeTask(notice, facts, dueDate).deadline).toBe(28);
    expect(timeTask({ ...notice, who: "partner" }, facts, dueDate).deadline).toBe(30);
  });
});
