import { describe, expect, test } from "vitest";
import type { Item, Task } from "../../src/content/schema";
import type { AppetiteEntry } from "../../src/lib/appetite";
import type { ISODate } from "../../src/lib/dates";
import type { Step } from "../../src/lib/feelings";
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
    feelings: [],
    appetite: [],
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
    const asked: Question = { id: "q", text: "?", answer: null, askedAt: "2026-10-29T01:00:00Z", itemId: null, by: null, createdAt: "2026-10-01T00:00:00Z" };
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
      different: false,
      by: null,
      createdAt: "2026-10-30T00:00:00Z",
      editedBy: null,
      editedAt: null,
    });
    const w = mapWeeks({ ...input, journal: [note("a", "2026-10-30"), note("b", "2026-11-02"), note("c", "2026-01-01")] });
    expect(w.filter((m) => m.kept > 0).map((m) => [m.week, m.kept])).toEqual([[28, 2]]);
    expect(w.some((m) => m.moved)).toBe(false);

    // A movement marks its week, uncounted, and isn't a note.
    const moved = (id: string, day: string): JournalEntry => ({ ...note(id, day), kind: "movement", body: "", time: "21:00" });
    const m = mapWeeks({ ...input, journal: [note("a", "2026-10-30"), moved("b", "2026-10-30"), moved("c", "2026-10-31")] });
    expect(m.filter((x) => x.moved).map((x) => x.week)).toEqual([28]);
    expect(m.find((x) => x.week === 28)?.kept).toBe(1);
  });

  test("a week shows how each of you felt, one step each, and nothing for a week without", () => {
    const felt = (id: string, by: string, day: string, step: Step) => ({ id, by, day, time: "20:00", step, createdAt: `${day}T00:00:00Z` });
    const w = mapWeeks({
      ...input,
      feelings: [
        felt("a", "sam", "2026-10-30", "low"),
        felt("b", "sam", "2026-11-02", "good"),
        felt("c", "sam", "2026-11-01", "okay"),
        felt("d", "alex", "2026-10-31", "great"),
      ],
    });
    expect(w.filter((m) => m.felt.length > 0).map((m) => [m.week, m.felt])).toEqual([[28, ["great", "okay"]]]);
    expect(mapWeeks({ ...input, dueDate: null, feelings: [felt("a", "sam", "2026-10-30", "low")] }).every((m) => m.felt.length === 0)).toBe(true);
  });

  test("a week says how many days had sickness, and its most kept craving", () => {
    const kept = (id: string, day: string, rest: Partial<AppetiteEntry>): AppetiteEntry => ({
      id,
      kind: "sick",
      day,
      time: null,
      how: "queasy",
      what: null,
      note: null,
      by: null,
      createdAt: `${day}T00:00:00Z`,
      editedBy: null,
      editedAt: null,
      ...rest,
    });
    const w = mapWeeks({
      ...input,
      appetite: [
        kept("a", "2026-10-30", {}),
        kept("b", "2026-10-30", { how: "vomited" }),
        kept("c", "2026-10-31", { kind: "craving", how: null, what: "Pickles" }),
      ],
    });
    const week = w.find((m) => m.week === 28)!;
    expect([week.sick, week.craved]).toEqual([1, "Pickles"]);
    expect(w.filter((m) => m.sick > 0 || m.craved).map((m) => m.week)).toEqual([28]);
  });

  test("a week says what it kept in pictures, and nothing without them", () => {
    const shot = (id: string, day: string, kind: "bump" | "scan" | "other") => ({
      id,
      fileId: id,
      kind,
      day,
      time: null,
      caption: null,
      by: null,
      createdAt: `${day}T00:00:00Z`,
      editedBy: null,
      editedAt: null,
    });
    const w = mapWeeks({ ...input, photos: [shot("a", "2026-10-30", "bump"), shot("b", "2026-10-31", "scan"), shot("c", "2026-10-31", "scan")] });
    expect(w.find((m) => m.week === 28)!.photos).toEqual({ bump: true, scans: 2, others: 0 });
    expect(w.filter((m) => m.photos.bump || m.photos.scans > 0).map((m) => m.week)).toEqual([28]);
    expect(mapWeeks(input).every((m) => !m.photos.bump && m.photos.scans === 0 && m.photos.others === 0)).toBe(true);
  });

  test("a week says what papers are dated in it, by kind, and nothing without them", () => {
    const paper = (id: string, day: string, kind: "result" | "letter") => ({
      id,
      kind,
      title: id,
      itemId: null,
      day,
      note: null,
      handy: false,
      pages: [],
      by: null,
      createdAt: `${day}T00:00:00Z`,
      editedBy: null,
      editedAt: null,
    });
    const w = mapWeeks({ ...input, papers: [paper("a", "2026-10-30", "result"), paper("b", "2026-10-31", "result"), paper("c", "2026-10-31", "letter")] });
    expect(w.find((m) => m.week === 28)!.papers).toEqual({ result: 2, letter: 1 });
    expect(w.filter((m) => Object.keys(m.papers).length > 0).map((m) => m.week)).toEqual([28]);
    expect(mapWeeks(input).every((m) => Object.keys(m.papers).length === 0)).toBe(true);
  });
});

test("the trimesters", () => {
  expect([1, 13, 14, 27, 28, 42].map(trimester)).toEqual([1, 1, 2, 2, 3, 3]);
});
