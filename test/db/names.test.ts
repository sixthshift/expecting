import { expect, test } from "vitest";
import { NamesRepo } from "../../src/db/models/names/repo";
import { PeopleRepo } from "../../src/db/models/people/repo";
import { useTestDb } from "./helpers";

const db = useTestDb();
const at = (day: number) => new Date(Date.UTC(2026, 9, day));

test("a name is a match only when both of you like it, and each sees only their own votes", () => {
  const people = new PeopleRepo(db());
  const jason = people.add("Jason", "partner");
  const sam = people.add("Sam", "carrying");
  const repo = new NamesRepo(db());
  const ada = repo.add("Ada", jason.id, at(1));
  const iris = repo.add("Iris", sam.id, at(2));
  repo.vote(ada, jason.id, true);
  repo.vote(iris, jason.id, true);
  repo.vote(ada, sam.id, false);

  expect(repo.view(jason.id)).toEqual({
    names: [
      { id: ada, name: "Ada", mine: true },
      { id: iris, name: "Iris", mine: true },
    ],
    matches: [],
    together: true,
  });
  // Sam hasn't voted on Iris: not yet a match, and Jason's like isn't shown.
  expect(repo.view(sam.id).names).toEqual([
    { id: ada, name: "Ada", mine: false },
    { id: iris, name: "Iris", mine: null },
  ]);

  repo.vote(iris, sam.id, true);
  expect(repo.view(jason.id).matches).toEqual([{ id: iris, name: "Iris" }]);
  expect(repo.view(sam.id).matches).toEqual([{ id: iris, name: "Iris" }]);
});

test("alone, nothing matches", () => {
  const jason = new PeopleRepo(db()).add("Jason", "partner");
  const repo = new NamesRepo(db());
  repo.vote(repo.add("Ada", jason.id), jason.id, true);
  expect(repo.view(jason.id)).toMatchObject({ matches: [], together: false });
});

test("a name is in the game once, whatever its case; removing it takes its votes", () => {
  const jason = new PeopleRepo(db()).add("Jason", "partner");
  const repo = new NamesRepo(db());
  const ada = repo.add("Ada", jason.id);
  expect(repo.add("ADA", jason.id)).toBe(ada);
  repo.vote(ada, jason.id, true);
  repo.vote(ada, jason.id, false);
  expect(repo.view(jason.id).names).toEqual([{ id: ada, name: "Ada", mine: false }]);
  repo.remove(ada);
  expect(repo.view(jason.id).names).toEqual([]);
  expect(db().query("SELECT count(*) AS n FROM name_vote").get()).toEqual({ n: 0 });
});
