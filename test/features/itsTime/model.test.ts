import { expect, test } from "vitest";
import { builtInItems } from "../../../src/content";
import { ALL_FLAGS, breechWaters, flagsFor } from "../../../src/features/itsTime/model/callNow";
import { stillToReady } from "../../../src/features/itsTime/model/ready";
import { theyllAsk } from "../../../src/features/itsTime/model/theyllAsk";
import type { Start } from "../../../src/lib/itsTime";

const open: Start = {
  id: "a",
  startedAt: "2026-11-20T02:14:00.000Z",
  by: null,
  watersAt: null,
  waters: null,
  leftAt: null,
  endedAt: null,
  ended: null,
  contractions: [],
  ticks: [],
};

test("every red flag is from an entry that exists, with a 'when to get help' part", () => {
  for (const f of ALL_FLAGS) {
    const item = builtInItems.find((i) => i.id === f.from);
    expect(item, f.from).toBeDefined();
    expect(item!.private).toBe(false);
  }
});

test("the breech line is shown unless you've been told head down, and leads the page once the waters break", () => {
  const keys = (facts: Record<string, string>) => flagsFor(facts).tripleZero.map((f) => f.key);
  expect(keys({})).toContain("breech");
  expect(keys({ presentation: "unsure" })).toContain("breech");
  expect(keys({ presentation: "breech" })).toContain("breech");
  expect(keys({ presentation: "head-down" })).not.toContain("breech");
  expect(keys({ birth: "caesarean" })).not.toContain("breech");
  expect(flagsFor({ birth: "caesarean" }).call[0]!.key).toBe("caesarean");
  expect(breechWaters({ presentation: "breech" }, open)).toBe(false);
  expect(breechWaters({ presentation: "breech" }, { ...open, watersAt: open.startedAt })).toBe(true);
  expect(breechWaters({ presentation: "unsure" }, { ...open, watersAt: open.startedAt })).toBe(false);
});

test("they'll ask: filled in from what's kept, blanks left out, the movements never", () => {
  const rows = theyllAsk({
    values: { fullName: "Alex Morgan", hospitalRecord: "4471923", pregnancy: "GBS positive" },
    facts: { firstBaby: "yes", babies: "one" },
    carrying: "Alex",
    dueDate: "2026-11-23",
    today: "2026-11-20",
    start: { ...open, watersAt: open.startedAt, waters: "clear" },
    pattern: { every: { min: 4, max: 5 }, lasting: 50, inTen: 3, inHour: 12 },
    holding: "partner",
  });
  expect(rows.map((r) => [r.label, r.value])).toEqual([
    ["Name", "Alex Morgan, record 4471923"],
    ["How far", "39+4 weeks, due Mon, 23 Nov"],
    ["First baby?", "Yes"],
    ["Waters", expect.stringMatching(/^Broke \d{1,2}:\d\d [ap]m, clear, pink or straw-coloured$/)],
    ["Contractions", "Every 4–5 min, about 50 s · 3 in the last 10 min"],
    ["Baby moving?", "Ask her"],
    ["Anything else", "GBS positive"],
  ]);
});

test("getting ready lists what the night still needs; a home birth needs the midwife, not a trip", () => {
  const all = stillToReady({ values: {}, facts: { firstBaby: "no" }, ticks: {} }).map((t) => t.key);
  expect(all).toEqual(["birthSuitePhone", "hospital", "hospitalWayIn", "hospitalSaid", "bag", "carSeat", "minder", "backupDriver"]);
  const home = stillToReady({ values: {}, facts: { birthPlace: "home", firstBaby: "yes" }, ticks: {} }).map((t) => t.key);
  expect(home).toEqual(["carerPhone", "hospital", "hospitalSaid"]);
  const done = stillToReady({
    values: { birthSuitePhone: "1", hospital: "x", hospitalWayIn: "x", hospitalSaid: "x", backupDriver: "Jo" },
    facts: {},
    ticks: { "pack-hospital-bag": "t", "buy-and-fit-car-seat": "t" },
  });
  expect(done).toEqual([]);
});
