import { expect, test } from "vitest";
import { PeopleRepo } from "../../src/db/models/people/repo";
import { QuietRepo } from "../../src/db/models/quiet/repo";
import { useTestDb } from "./helpers";

const db = useTestDb();
const at = (day: number) => new Date(Date.UTC(2026, 9, day));

test("nothing has happened until someone says so", () => {
  expect(new QuietRepo(db()).get()).toBeNull();
});

test("the latest word stands, with who said it and when, and bringing Expecting back clears it", () => {
  const sam = new PeopleRepo(db()).add("Sam", "partner");
  const repo = new QuietRepo(db());
  repo.set("news", null, at(1));
  repo.set("loss", sam.id, at(2));
  expect(repo.get()).toEqual({ kind: "loss", setBy: sam.id, setAt: at(2).toISOString() });
  repo.clear();
  expect(repo.get()).toBeNull();
});

test("it outlives the person who said it", () => {
  const sam = new PeopleRepo(db()).add("Sam", "partner");
  const repo = new QuietRepo(db());
  repo.set("loss", sam.id, at(1));
  db().run("DELETE FROM person");
  expect(repo.get()).toEqual({ kind: "loss", setBy: null, setAt: at(1).toISOString() });
});

test("only a loss or hard news", () => {
  expect(() => db().run("INSERT INTO quiet (id, kind, set_at) VALUES (1, 'other', 'x')")).toThrow();
});
