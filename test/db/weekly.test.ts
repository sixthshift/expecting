import { expect, test } from "vitest";
import { PeopleRepo } from "../../src/db/models/people/repo";
import { WeeklyRepo } from "../../src/db/models/weekly/repo";
import { useTestDb } from "./helpers";

const db = useTestDb();
const AT = new Date("2026-11-01T00:00:00Z");
const LATER = new Date("2026-11-02T00:00:00Z");

test("neither sees the other's answer until both have answered; a phone that hasn't said sees only what both have", () => {
  const people = new PeopleRepo(db());
  const jason = people.add("Jason", "partner");
  const sam = people.add("Sam", "carrying");
  const repo = new WeeklyRepo(db());
  repo.answer(20, sam.id, " Google ", AT);
  expect(repo.view(jason.id).weeks).toEqual([]);
  expect(repo.view(sam.id).weeks).toEqual([{ week: 20, mine: { body: "Google", by: sam.id, answeredAt: AT.toISOString() }, theirs: null }]);
  expect(repo.view(null).weeks).toEqual([]);

  repo.answer(20, jason.id, "Ask Mum", LATER);
  expect(repo.view(jason.id).weeks[0]).toMatchObject({ mine: { body: "Ask Mum" }, theirs: { body: "Google" } });
  expect(repo.view(null).weeks[0]).toMatchObject({ mine: { body: "Google" }, theirs: { body: "Ask Mum" } });
});

test("answered again keeps when it was first answered; emptied, it's taken back", () => {
  const sam = new PeopleRepo(db()).add("Sam", "carrying");
  const repo = new WeeklyRepo(db());
  repo.answer(9, sam.id, "Patience", AT);
  repo.answer(9, sam.id, "Patience, and pancakes", LATER);
  expect(repo.view(sam.id).weeks[0]?.mine).toEqual({ body: "Patience, and pancakes", by: sam.id, answeredAt: AT.toISOString() });
  repo.answer(9, sam.id, "  ");
  expect(repo.view(sam.id).weeks).toEqual([]);
});
