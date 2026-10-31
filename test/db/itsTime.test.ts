import { expect, test } from "vitest";
import { ItsTimeRepo } from "../../src/db/models/itsTime/repo";
import { PeopleRepo } from "../../src/db/models/people/repo";
import { useTestDb } from "./helpers";

const db = useTestDb();
const at = (time: string) => new Date(`2026-11-20T${time}:00.000Z`);
const iso = (time: string) => at(time).toISOString();
const A = "00000000-0000-4000-8000-00000000000a";
const B = "00000000-0000-4000-8000-00000000000b";
const C1 = "00000000-0000-4000-8000-0000000000c1";
const C2 = "00000000-0000-4000-8000-0000000000c2";

test("a start: the waters, its contractions, leaving and getting there, each keeping its first time", () => {
  const sam = new PeopleRepo(db()).add("Sam", "carrying");
  const repo = new ItsTimeRepo(db());
  repo.begin(A, true, sam.id, at("02:14"));
  // The other phone opens one too: it's the same start, and its saves land on it.
  repo.begin(B, false, null, at("02:15"));
  repo.setWaters(B, "clear", at("02:20"));
  repo.setWaters(A, null, at("02:21"));
  repo.beginContraction(C1, A, sam.id, at("02:30"));
  // The next one begins before the first was ended: the first ends then.
  repo.beginContraction(C2, A, null, at("02:35"));
  repo.endContraction(C2, A, iso("02:35"), at("02:36"));
  repo.endContraction(C2, A, iso("02:35"), at("02:40"));
  repo.noteContraction(C2, "  Had to stop ");
  repo.leave(A, at("03:05"));
  repo.leave(A, at("03:10"));
  repo.tick(A, "bag-chargers", true, sam.id, at("03:00"));
  repo.tick(A, "bag-chargers", true, null, at("03:01"));
  repo.end(A, "there", at("03:40"));
  // Ended, a late save for it does nothing.
  repo.tick(A, "bag-cash", true, null, at("03:41"));

  const { starts } = repo.get();
  expect(starts).toHaveLength(1);
  expect(starts[0]).toMatchObject({
    id: A,
    by: sam.id,
    startedAt: iso("02:14"),
    watersAt: iso("02:14"),
    waters: "clear",
    leftAt: iso("03:05"),
    ended: "there",
    endedAt: iso("03:40"),
    ticks: ["bag-chargers"],
  });
  expect(starts[0]!.contractions).toEqual([
    { id: C1, startedAt: iso("02:30"), endedAt: iso("02:35"), note: null, by: sam.id },
    { id: C2, startedAt: iso("02:35"), endedAt: iso("02:36"), note: "Had to stop", by: null },
  ]);
});

test("saves that arrive out of order make the same night: the outbox sends what waited offline all at once", () => {
  const repo = new ItsTimeRepo(db());
  // Made: start 02:00, contraction 02:10 to 02:11, the next at 02:15, waters at 02:20. Arrived backwards.
  repo.setWaters(A, "clear", at("02:20"));
  repo.beginContraction(C2, A, null, at("02:15"));
  repo.endContraction(C1, A, iso("02:10"), at("02:11"));
  repo.beginContraction(C1, A, null, at("02:10"));
  repo.begin(A, false, null, at("02:00"));
  const [start] = repo.get().starts;
  expect(start).toMatchObject({ id: A, startedAt: iso("02:00"), watersAt: iso("02:20"), waters: "clear", endedAt: null });
  expect(start!.contractions.map((c) => [c.id, c.startedAt, c.endedAt])).toEqual([
    [C1, iso("02:10"), iso("02:11")],
    [C2, iso("02:15"), null],
  ]);
  // An earlier beginning that arrives after a later one ended when the later one began.
  repo.beginContraction(B, A, null, at("02:05"));
  expect(repo.get().starts[0]!.contractions[0]).toMatchObject({ id: B, endedAt: iso("02:10") });
});

test("one start under way at a time", () => {
  const repo = new ItsTimeRepo(db());
  repo.begin(A, false, null, at("01:00"));
  repo.end(A, "home", at("02:00"));
  repo.begin(B, false, null, at("05:00"));
  expect(repo.get().starts.map((s) => [s.id, s.ended])).toEqual([
    [B, null],
    [A, "home"],
  ]);
  expect(() => db().run("INSERT INTO labour_start (id, started_at) VALUES ('x', '2026-11-20T06:00:00.000Z')")).toThrow();
});

test("a start deleted takes its contractions and ticks; an own line deleted takes its ticks", () => {
  const repo = new ItsTimeRepo(db());
  repo.addLine(C1, "  Turn the heater off ", null, at("00:00"));
  repo.begin(A, false, null, at("01:00"));
  repo.beginContraction(C2, A, null, at("01:05"));
  repo.tick(A, C1, true, null, at("01:06"));
  expect(repo.get().lines).toEqual([{ id: C1, title: "Turn the heater off", by: null, createdAt: iso("00:00") }]);
  repo.deleteLine(C1);
  expect(repo.get().starts[0]!.ticks).toEqual([]);
  repo.delete(A);
  expect(repo.get()).toEqual({ starts: [], lines: [] });
  expect(db().query("SELECT count(*) AS n FROM contraction").get()).toEqual({ n: 0 });
});
