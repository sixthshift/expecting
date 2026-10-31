import { expect, test } from "vitest";
import { type Contraction, clock, itsTimeShown, lasted, nightLine, nightsOf, patternOf, type Start, sayPattern, shownFrom } from "../../src/lib/itsTime";

// Times written as local, so the clock reads them back as written.
const t = (hm: string, day = "2026-11-20") => new Date(`${day}T${hm}:00`).toISOString();
const c = (from: string, to: string | null, id = from): Contraction => ({ id, startedAt: t(from), endedAt: to ? t(to) : null, note: null, by: null });

function start(over: Partial<Start> = {}): Start {
  return {
    id: "a",
    startedAt: t("02:14"),
    by: null,
    watersAt: null,
    waters: null,
    leftAt: null,
    endedAt: null,
    ended: null,
    contractions: [],
    ticks: [],
    ...over,
  };
}

test("shown from 36 weeks, 32 for twins or more; while a start is under way; never while quiet", () => {
  expect(shownFrom({})).toBe(36);
  expect(shownFrom({ babies: "twins" })).toBe(32);
  expect(shownFrom({ babies: "more" })).toBe(32);
  expect(itsTimeShown({ now: 35, facts: {}, quiet: false, open: false })).toBe(false);
  expect(itsTimeShown({ now: 36, facts: {}, quiet: false, open: false })).toBe(true);
  expect(itsTimeShown({ now: 33, facts: { babies: "twins" }, quiet: false, open: false })).toBe(true);
  expect(itsTimeShown({ now: 30, facts: {}, quiet: false, open: true })).toBe(true);
  expect(itsTimeShown({ now: null, facts: {}, quiet: false, open: false })).toBe(false);
  expect(itsTimeShown({ now: 39, facts: {}, quiet: true, open: true })).toBe(false);
});

test("the pattern is what the midwife asks: how often start to start, how long, how many in 10 minutes; never a verdict", () => {
  const cs = [c("02:30", "02:30"), c("02:42", "02:42"), c("02:47", "02:47"), c("02:51", "02:52")].map((x, i) => ({
    ...x,
    endedAt: new Date(new Date(x.startedAt).getTime() + [45, 50, 55, 60][i]! * 1000).toISOString(),
  }));
  const p = patternOf(cs, new Date(t("02:55")));
  expect(p).toEqual({ every: { min: 4, max: 12 }, lasting: 55, inTen: 2, inHour: 4 });
  expect(sayPattern(p)).toBe("every 4–12 min, about 55 s");
  // Older than an hour isn't counted; one alone has no "every".
  expect(patternOf(cs, new Date(t("03:50")))).toEqual({ every: null, lasting: 60, inTen: 0, inHour: 1 });
  expect(sayPattern({ every: null, lasting: null, inTen: 0, inHour: 0 })).toBeNull();
  expect(sayPattern({ every: { min: 5, max: 5 }, lasting: null, inTen: 2, inHour: 6 })).toBe("every 5 min");
});

test("how long one lasted, and the time of day", () => {
  expect(lasted(c("02:30", null))).toBeNull();
  expect(lasted({ ...c("02:30", null), endedAt: new Date(new Date(t("02:30")).getTime() + 55_000).toISOString() })).toBe("55 s");
  expect(lasted(c("02:30", "02:31"))).toBe("1 min");
  expect(clock(t("02:14"))).toBe("2:14 am");
  expect(clock(t("15:05"))).toBe("3:05 pm");
});

test("the nights: a start that ended there, with the false alarms since the one before folded in", () => {
  const falseOne = start({ id: "f", startedAt: t("21:00", "2026-11-17"), ended: "home", endedAt: t("23:00", "2026-11-17") });
  const real = start({
    id: "r",
    watersAt: t("02:14"),
    waters: "clear",
    contractions: [c("02:30", "02:31")],
    leftAt: t("03:05"),
    ended: "there",
    endedAt: t("03:40"),
  });
  const underWay = start({ id: "u", startedAt: t("05:00") });
  const nights = nightsOf([underWay, real, falseOne]);
  expect(nights).toEqual([{ start: real, falseStarts: [falseOne] }]);
  expect(nightLine(nights[0]!)).toBe("Waters broke 2:14 am (clear) · timing from 2:30 am · left 3:05 am · there 3:40 am, after a false start on Tue");
  // A false alarm alone isn't a night.
  expect(nightsOf([falseOne])).toEqual([]);
  // With neither waters nor timing, it says when it started.
  expect(nightLine({ start: start({ ended: "there", endedAt: t("04:00") }), falseStarts: [] })).toBe("Started 2:14 am · there 4:00 am");
  // The colour is said only when clear: the other colours were a call, not a memory.
  expect(nightLine({ start: start({ watersAt: t("02:14"), waters: "unsure", ended: "there", endedAt: t("04:00") }), falseStarts: [] })).toBe(
    "Waters broke 2:14 am · there 4:00 am"
  );
});
