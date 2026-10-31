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
      { id: ada, name: "Ada", mine: true, deck: false },
      { id: iris, name: "Iris", mine: true, deck: false },
    ],
    matches: [],
    together: true,
  });
  // Sam hasn't voted on Iris: not yet a match, and Jason's like isn't shown.
  expect(repo.view(sam.id).names).toEqual([
    { id: ada, name: "Ada", mine: false, deck: false },
    { id: iris, name: "Iris", mine: null, deck: false },
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
  expect(repo.view(jason.id).names).toEqual([{ id: ada, name: "Ada", mine: false, deck: false }]);
  repo.remove(ada);
  expect(repo.view(jason.id).names).toEqual([]);
  expect(db().query("SELECT count(*) AS n FROM name_vote").get()).toEqual({ n: 0 });
});

test("a name keeps the id its phone gave it; sent twice, it is the one name", () => {
  const jason = new PeopleRepo(db()).add("Jason", "partner");
  const repo = new NamesRepo(db());
  const id = "11111111-1111-4111-8111-111111111111";
  expect(repo.add("Ada", jason.id, new Date(), id)).toBe(id);
  expect(repo.add("Ada", jason.id, new Date(), id)).toBe(id);
  expect(repo.view(jason.id).names).toEqual([{ id, name: "Ada", mine: null, deck: false }]);
});

test("a deck name joins the game when first swiped, and the other only sees it if it was liked", () => {
  const people = new PeopleRepo(db());
  const jason = people.add("Jason", "partner");
  const sam = people.add("Sam", "carrying");
  const repo = new NamesRepo(db());
  const hazel = repo.swipe("Hazel", jason.id, true, at(1));
  const beryl = repo.swipe("Beryl", jason.id, false, at(1));
  expect(repo.view(jason.id).names).toEqual([
    { id: hazel, name: "Hazel", mine: true, deck: true },
    { id: beryl, name: "Beryl", mine: false, deck: true },
  ]);
  // Sam is dealt Hazel soon, as one to vote on; Beryl, which Jason passed, isn't there to give it away.
  expect(repo.view(sam.id).names).toEqual([{ id: hazel, name: "Hazel", mine: null, deck: true }]);

  // Sam's phone made its own row for Hazel offline: the name's row takes the vote, and it's a match.
  expect(repo.swipe("hazel", sam.id, true, at(2), "22222222-2222-4222-8222-222222222222")).toBe(hazel);
  expect(repo.view(sam.id).matches).toEqual([{ id: hazel, name: "Hazel" }]);
});

test("a vote taken back by name; a deck name nobody has voted on leaves the game, an added one stays", () => {
  const jason = new PeopleRepo(db()).add("Jason", "partner");
  const repo = new NamesRepo(db());
  repo.swipe("Hazel", jason.id, true);
  const ada = repo.add("Ada", jason.id);
  repo.vote(ada, jason.id, true);
  repo.unvote("HAZEL", jason.id);
  repo.unvote("Ada", jason.id);
  repo.unvote("Nobody", jason.id);
  expect(repo.view(jason.id).names).toEqual([{ id: ada, name: "Ada", mine: null, deck: false }]);
});
