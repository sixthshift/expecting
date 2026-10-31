import { expect, test } from "vitest";
import { ItsTimeRepo } from "../../src/db/models/itsTime/repo";
import { PeopleRepo } from "../../src/db/models/people/repo";
import { useTestDb } from "./helpers";

const db = useTestDb();
const at = (time: string) => new Date(`2026-11-20T${time}:00.000Z`);
const A = "00000000-0000-4000-8000-00000000000a";
const B = "00000000-0000-4000-8000-00000000000b";
const C1 = "00000000-0000-4000-8000-0000000000c1";
const C2 = "00000000-0000-4000-8000-0000000000c2";

test("a start: the waters, its contractions, leaving and getting there, each keeping its first time", () => {
  const sam = new PeopleRepo(db()).add("Sam", "carrying");
  const repo = new ItsTimeRepo(db());
  repo.begin(A, true, sam.id, at("02:14"));
  // The other phone opens one too: it's the same start.
  repo.begin(B, false, null, at("02:15"));
  repo.setWaters("clear", at("02:20"));
  repo.setWaters(null, at("02:21"));
  repo.beginContraction(C1, sam.id, at("02:30"));
  // The next one begins before the first was ended: the first ends then.
  repo.beginContraction(C2, null, at("02:35"));
  repo.endContraction(C2, at("02:36"));
  repo.endContraction(C2, at("02:40"));
  repo.noteContraction(C2, "  Had to stop ");
  repo.leave(at("03:05"));
  repo.leave(at("03:10"));
  repo.tick("bag-chargers", true, sam.id, at("03:00"));
  repo.tick("bag-chargers", true, null, at("03:01"));
  repo.end("there", at("03:40"));

  const { starts } = repo.get();
  expect(starts).toHaveLength(1);
  expect(starts[0]).toMatchObject({
    id: A,
    by: sam.id,
    startedAt: at("02:14").toISOString(),
    watersAt: at("02:14").toISOString(),
    waters: "clear",
    leftAt: at("03:05").toISOString(),
    ended: "there",
    endedAt: at("03:40").toISOString(),
    ticks: ["bag-chargers"],
  });
  expect(starts[0]!.contractions).toEqual([
    { id: C1, startedAt: at("02:30").toISOString(), endedAt: at("02:35").toISOString(), note: null, by: sam.id },
    { id: C2, startedAt: at("02:35").toISOString(), endedAt: at("02:36").toISOString(), note: "Had to stop", by: null },
  ]);
});

test("with nothing under way, a tap lands nowhere; one start under way at a time", () => {
  const repo = new ItsTimeRepo(db());
  repo.beginContraction(C1, null, at("01:00"));
  repo.tick("bag-cash", true, null, at("01:00"));
  repo.leave(at("01:00"));
  repo.end("home", at("01:00"));
  expect(repo.get().starts).toEqual([]);

  repo.begin(A, false, null, at("01:00"));
  repo.end("home", at("02:00"));
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
  repo.beginContraction(C2, null, at("01:05"));
  repo.tick(C1, true, null, at("01:06"));
  expect(repo.get().lines).toEqual([{ id: C1, title: "Turn the heater off", by: null, createdAt: at("00:00").toISOString() }]);
  repo.deleteLine(C1);
  expect(repo.get().starts[0]!.ticks).toEqual([]);
  repo.delete(A);
  expect(repo.get()).toEqual({ starts: [], lines: [] });
  expect(db().query("SELECT count(*) AS n FROM contraction").get()).toEqual({ n: 0 });
});
