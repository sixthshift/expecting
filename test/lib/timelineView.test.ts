import Markdoc from "@markdoc/markdoc";
import { describe, expect, test } from "vitest";
import type { Item, Task } from "../../src/content/schema";
import type { ISODate } from "../../src/lib/dates";
import type { Question } from "../../src/lib/questions";
import type { Slot } from "../../src/lib/timeline";
import { buildBands, rulerMarks, type TimelineInput } from "../../src/lib/timelineView";

const wk = (week: number): Slot => ({ phase: "pregnancy", week });

function item(id: string, from: number, to: number, extra: Partial<Item> = {}): Item {
  return {
    id,
    title: id,
    from: wk(from),
    to: wk(to),
    category: "body",
    surprise: false,
    draft: true,
    source: null,
    checked: null,
    when: {},
    body: "x",
    doc: Markdoc.parse("x"),
    tasks: [],
    origin: "built-in",
    ...extra,
  };
}

const task = (id: string, week: number, itemId: string | null = "i"): Task => ({ id, title: id, due: wk(week), itemId, origin: itemId ? "built-in" : "own" });

const rsv = item("rsv", 28, 36, { surprise: true });
const flu = item("flu", 4, 40);
const gtt = item("gtt", 24, 28);
const tasks = [task("book-gtt", 25, "gtt"), task("book-rsv", 30, "rsv"), task("own-snacks", 28, null)];

const base: TimelineInput = {
  items: [flu, gtt, rsv],
  tasks,
  ticks: {},
  questions: [],
  now: wk(28),
  dueDate: "2027-01-19" as ISODate,
  birthDate: null,
};

const band = (bands: ReturnType<typeof buildBands>, key: string) => bands.find((b) => b.key === key)!;

describe("the timeline", () => {
  const bands = buildBands(base);

  test("every week is there, from before to 12 weeks after", () => {
    expect(bands).toHaveLength(55);
    expect(bands[0]!.key).toBe("preconception");
    expect(bands.at(-1)!.key).toBe("pp12");
  });

  test("an item appears once, in the week it starts", () => {
    expect(bands.filter((b) => b.starting.some((i) => i.id === "rsv")).map((b) => b.key)).toEqual(["28"]);
  });

  test("the current week carries what is still relevant and what has slipped", () => {
    const now = band(bands, "28");
    expect(now.isNow).toBe(true);
    expect(now.continuing.map((i) => i.id)).toEqual(["flu", "gtt"]);
    expect(now.slipped.map((t) => t.id)).toEqual(["book-gtt"]);
    expect(band(bands, "29").continuing).toEqual([]);
  });

  test("standalone tasks sit loose in their week; item tasks stay in their card", () => {
    expect(band(bands, "28").tasks.map((t) => t.id)).toEqual(["own-snacks"]);
    expect(band(bands, "30").tasks).toEqual([]);
    expect(band(bands, "30").openTasks).toBe(1);
  });
});

test("asked questions land in the week they were asked: the diary", () => {
  const q = (id: string, askedAt: string | null): Question => ({ id, text: id, answer: null, askedAt, createdAt: "2026-01-01T00:00:00Z" });
  // Due 19 Jan 2027: 1 Oct 2026 is 110 days before, so 24+2.
  const bands = buildBands({ ...base, questions: [q("open", null), q("asked", "2026-10-01T09:00:00Z")] });
  expect(bands.filter((b) => b.asked.length > 0).map((b) => [b.key, b.asked.map((x) => x.id)])).toEqual([["24", ["asked"]]]);
});

test("a question asked just after midnight lands in that local day's week, not the UTC one", () => {
  const tz = process.env.TZ;
  process.env.TZ = "Australia/Sydney";
  try {
    const q: Question = { id: "early", text: "early", answer: null, askedAt: "2026-10-26T13:30:00Z", createdAt: "2026-01-01T00:00:00Z" };
    // 00:30 on Tue 27 Oct in Sydney, still the 26th in UTC. Due 19 Jan 2027, the 27th is 28+0.
    const bands = buildBands({ ...base, questions: [q] });
    expect(bands.find((b) => b.asked.length > 0)?.key).toBe("28");
  } finally {
    process.env.TZ = tz;
  }
});

test("with no due date there is no now, and every week is still readable", () => {
  const bands = buildBands({ ...base, now: null, dueDate: null });
  expect(bands.some((b) => b.isNow || b.isPast)).toBe(false);
  expect(bands.every((b) => b.slipped.length === 0 && b.continuing.length === 0)).toBe(true);
});

test("the ruler marks what starts where and what has slipped", () => {
  const marks = rulerMarks(base.items, tasks, {}, wk(28));
  const at = (key: string) => marks.find((m) => m.key === key)!;
  expect(at("4").starting).toBe(1);
  expect(at("25").overdue).toBe(true);
  expect(at("30").overdue).toBe(false);
  expect(at("28").isNow).toBe(true);
});
