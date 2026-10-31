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
    shortlist: [],
    off: [],
    superliked: null,
    together: true,
  });
  // Sam hasn't voted on Iris: not yet a match, and Jason's like isn't shown.
  expect(repo.view(sam.id).names).toEqual([
    { id: ada, name: "Ada", mine: false, deck: false },
    { id: iris, name: "Iris", mine: null, deck: false },
  ]);

  repo.vote(iris, sam.id, true);
  expect(repo.view(jason.id).shortlist).toEqual([{ id: iris, name: "Iris", star: false }]);
  expect(repo.view(sam.id).shortlist).toEqual([{ id: iris, name: "Iris", star: false }]);
});

test("alone, nothing matches", () => {
  const jason = new PeopleRepo(db()).add("Jason", "partner");
  const repo = new NamesRepo(db());
  repo.vote(repo.add("Ada", jason.id), jason.id, true);
  expect(repo.view(jason.id)).toMatchObject({ shortlist: [], together: false });
});

test("a name is in the game once, whatever its case", () => {
  const jason = new PeopleRepo(db()).add("Jason", "partner");
  const repo = new NamesRepo(db());
  const ada = repo.add("Ada", jason.id);
  expect(repo.add("ADA", jason.id)).toBe(ada);
  repo.vote(ada, jason.id, true);
  repo.vote(ada, jason.id, false);
  expect(repo.view(jason.id).names).toEqual([{ id: ada, name: "Ada", mine: false, deck: false }]);
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
  expect(repo.view(sam.id).shortlist).toEqual([{ id: hazel, name: "Hazel", star: false }]);
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

test("a superlike puts a name on the shortlist without the other: starred, never saying whose, one a day", () => {
  const people = new PeopleRepo(db());
  const jason = people.add("Jason", "partner");
  const sam = people.add("Sam", "carrying");
  const repo = new NamesRepo(db());
  // Sam passed on Hazel; Jason's superlike puts it on all the same.
  repo.swipe("Hazel", sam.id, false, at(1));
  const hazel = repo.superlike("Hazel", jason.id, "2026-11-01", at(1));
  expect(hazel).not.toBeNull();
  expect(repo.view(sam.id).shortlist).toEqual([{ id: hazel, name: "Hazel", star: true }]);
  expect(repo.view(jason.id).superliked).toEqual({ name: "Hazel", on: "2026-11-01" });
  expect(repo.view(sam.id).superliked).toBeNull();

  // The same one sent twice is the one; a second name the same day is turned away; the next day, another.
  expect(repo.superlike("hazel", jason.id, "2026-11-01", at(1))).toBe(hazel);
  expect(repo.superlike("Iris", jason.id, "2026-11-01", at(1))).toBeNull();
  expect(repo.view(jason.id).names.map((n) => n.name)).toEqual(["Hazel"]);
  const iris = repo.superlike("Iris", jason.id, "2026-11-02", at(2));
  expect(repo.view(jason.id).superliked).toEqual({ name: "Iris", on: "2026-11-02" });

  // Undone, it's off the shortlist and the day's superlike is back.
  repo.unvote("Iris", jason.id);
  expect(repo.view(jason.id).shortlist.map((n) => n.id)).toEqual([hazel]);
  expect(repo.superlike("Ada", jason.id, "2026-11-02", at(2))).not.toBeNull();
  expect(iris).not.toBeNull();
});

test("either of you takes a name off the shortlist: it leaves the game, until it's typed again", () => {
  const people = new PeopleRepo(db());
  const jason = people.add("Jason", "partner");
  const sam = people.add("Sam", "carrying");
  const repo = new NamesRepo(db());
  const ada = repo.add("Ada", jason.id, at(1));
  repo.vote(ada, jason.id, true);
  repo.vote(ada, sam.id, true);
  expect(repo.view(jason.id).shortlist).toEqual([{ id: ada, name: "Ada", star: false }]);

  repo.takeOff(ada, at(2));
  expect(repo.view(jason.id)).toMatchObject({ shortlist: [], off: [{ id: ada, name: "Ada" }] });
  expect(repo.view(sam.id).off).toEqual([{ id: ada, name: "Ada" }]);

  repo.add("ada", sam.id, at(3));
  expect(repo.view(sam.id)).toMatchObject({ shortlist: [{ id: ada, name: "Ada", star: false }], off: [] });
});
