import { expect, test } from "vitest";
import { ExtrasRepo } from "../../src/db/models/extras/repo";
import { PeopleRepo } from "../../src/db/models/people/repo";
import { useTestDb } from "./helpers";

const db = useTestDb();
const at = (day: number) => new Date(Date.UTC(2026, 9, day));

test("nothing is decided until someone chooses", () => {
  expect(new ExtrasRepo(db()).list()).toEqual([]);
});

test("the latest choice stands, with who made it and when", () => {
  const sam = new PeopleRepo(db()).add("Sam", "partner");
  const repo = new ExtrasRepo(db());
  repo.set({ id: "baby-shower", on: true, changedBy: null }, at(1));
  repo.set({ id: "babymoon", on: false, changedBy: null }, at(2));
  repo.set({ id: "baby-shower", on: false, changedBy: sam.id }, at(3));
  expect(repo.list()).toEqual([
    { id: "baby-shower", on: false, changedBy: sam.id, changedAt: at(3).toISOString() },
    { id: "babymoon", on: false, changedBy: null, changedAt: at(2).toISOString() },
  ]);
});

test("a choice outlives the person who made it", () => {
  const people = new PeopleRepo(db());
  const sam = people.add("Sam", "partner");
  const repo = new ExtrasRepo(db());
  repo.set({ id: "babymoon", on: true, changedBy: sam.id }, at(1));
  db().run("DELETE FROM person");
  expect(repo.list()).toEqual([{ id: "babymoon", on: true, changedBy: null, changedAt: at(1).toISOString() }]);
});
