import { describe, expect, test } from "vitest";
import type { Item, Task } from "../../src/content/schema";
import type { ISODate } from "../../src/lib/dates";
import type { JournalEntry } from "../../src/lib/journal";
import type { Question } from "../../src/lib/questions";
import { type MapInput, mapWeeks, mapWindows, trimester } from "../../src/lib/timelineMap";

const task = (id: string, due: number, itemId: string | null = "i"): Task => ({
  id,
  title: id,
  opens: 1,
  due,
  deadline: null,
  deadlineFrom: null,
  who: "together",
  itemId,
  origin: itemId ? "built-in" : "own",
});

function item(id: string, from: number, to: number, tasks: Task[] = [task(`${id}-task`, to, id)]): Item {
  return {
    id,
    title: id,
    summary: null,
    from,
    to,
    type: "moment",
    topic: "body",
    ask: null,
    aliases: [],
    who: null,
    stakes: null,
    verdict: null,
    decideBy: null,
    surprise: false,
    private: false,
    draft: true,
    when: {},
    extra: null,
    variables: [],
    tasks,
    origin: "built-in",
  };
}

const screening = item("screening", 11, 13);
const gtt = item("gtt", 24, 28);
const rsv = item("rsv", 28, 36);
const bag = item("bag", 32, 36);
const reading = item("reading", 20, 22, []);

describe("the windows", () => {
  const windows = mapWindows([rsv, reading, gtt, bag, screening], {}, 28);

  test("only what asks something of you, by its first week", () => {
    expect(windows.map((w) => w.item.id)).toEqual(["screening", "gtt", "rsv", "bag"]);
  });

  test("each says where it stands today", () => {
    expect(Object.fromEntries(windows.map((w) => [w.item.id, w.state]))).toEqual({ screening: "past", gtt: "open", rsv: "open", bag: "ahead" });
  });

  test("a window whose tasks are all ticked is done, whenever it is", () => {
    expect(mapWindows([bag], { "bag-task": "2026-10-28T00:00:00Z" }, 28)[0]?.state).toBe("done");
  });
});

describe("the weeks", () => {
  const input: MapInput = {
    notes: [],
    windows: mapWindows([gtt, rsv], {}, 28),
    tasks: [task("gtt-task", 26, "gtt"), task("rsv-task", 30, "rsv"), task("snacks", 28, null), task("done", 28, null)],
    ticks: { done: "2026-10-28T00:00:00Z" },
    questions: [],
    journal: [],
    now: 28,
    dueDate: "2027-01-19" as ISODate,
  };
  const weeks = mapWeeks(input);
  const at = (w: number) => weeks.find((m) => m.week === w)!;

  test("every week, 1 to 42, with the landmarks", () => {
    expect(weeks.map((w) => w.week)).toEqual(Array.from({ length: 42 }, (_, i) => i + 1));
    expect(weeks.filter((w) => w.landmark).map((w) => [w.week, w.landmark])).toEqual([
      [20, "Halfway"],
      [37, "Full term"],
      [40, "Due date"],
    ]);
  });

  test("a window opens on its first week only", () => {
    expect(weeks.filter((w) => w.opening.length > 0).map((w) => [w.week, w.opening.map((i) => i.id)])).toEqual([
      [24, ["gtt"]],
      [28, ["rsv"]],
    ]);
  });

  test("what's to do and done in each week, and what has slipped behind today", () => {
    expect([at(28).toDo, at(28).done, at(28).isNow]).toEqual([1, 1, true]);
    expect(at(26).slipped).toBe(true);
    expect(at(30).slipped).toBe(false);
  });

  test("an asked question counts in the week it was asked", () => {
    const asked: Question = { id: "q", text: "?", answer: null, askedAt: "2026-10-29T01:00:00Z", createdAt: "2026-10-01T00:00:00Z" };
    const w = mapWeeks({ ...input, questions: [asked] });
    expect(w.filter((m) => m.asked > 0).map((m) => m.week)).toEqual([28]);
  });

  test("a note counts in the week of its day, and one from before the pregnancy in none", () => {
    const note = (id: string, day: string): JournalEntry => ({
      id,
      kind: "note",
      day,
      time: null,
      body: "…",
      by: null,
      createdAt: "2026-10-30T00:00:00Z",
      editedBy: null,
      editedAt: null,
    });
    const w = mapWeeks({ ...input, journal: [note("a", "2026-10-30"), note("b", "2026-11-02"), note("c", "2026-01-01")] });
    expect(w.filter((m) => m.kept > 0).map((m) => [m.week, m.kept])).toEqual([[28, 2]]);
  });
});

test("the trimesters", () => {
  expect([1, 13, 14, 27, 28, 42].map(trimester)).toEqual([1, 1, 2, 2, 3, 3]);
});
