import { expect, test } from "vitest";
import { ListsRepo } from "../../src/db/models/lists/repo";
import { PeopleRepo } from "../../src/db/models/people/repo";
import { useTestDb } from "./helpers";

const db = useTestDb();

const LIST = "11111111-1111-4111-8111-111111111111";
const LINE = "22222222-2222-4222-8222-222222222222";
const AT = new Date("2026-11-01T00:00:00Z");

test("a list of your own, a line on it, renamed and changed, by its phone's ids, once however often it's sent", () => {
  const repo = new ListsRepo(db());
  repo.addList({ id: LIST, title: "Bunnings run" }, null, AT);
  repo.addList({ id: LIST, title: "Again" }, null, AT);
  repo.addLine({ id: LINE, listId: LIST, title: "Hooks" }, null, AT);
  repo.addLine({ id: LINE, listId: LIST, title: "Again" }, null, AT);
  repo.renameList(LIST, "Hardware");
  repo.changeLine(LINE, { title: "Wall hooks", section: null });
  expect(repo.all()).toEqual({
    ownLists: [{ id: LIST, title: "Hardware", by: null, createdAt: AT.toISOString() }],
    ownLines: [{ id: LINE, listId: LIST, title: "Wall hooks", section: null, by: null, createdAt: AT.toISOString() }],
    marks: {},
  });
  expect(repo.hasList(LIST)).toBe(true);
  expect(repo.hasLine(LINE)).toBe(true);
});

test("a mark says who set it last; how is kept only once got, words are trimmed, and with neither a state nor words it goes", () => {
  const sam = new PeopleRepo(db()).add("Sam", "carrying");
  const repo = new ListsRepo(db());
  repo.mark("get-car-seat", { state: "arranged", how: "bought", note: "  Mum's lending hers " }, sam.id, AT);
  expect(repo.all().marks).toEqual({
    "get-car-seat": { lineId: "get-car-seat", state: "arranged", how: null, note: "Mum's lending hers", by: sam.id, updatedAt: AT.toISOString() },
  });
  repo.mark("get-car-seat", { state: "got", how: "borrowed", note: "Mum's lending hers" }, null, AT);
  expect(repo.all().marks["get-car-seat"]).toMatchObject({ state: "got", how: "borrowed", by: null });
  repo.mark("get-car-seat", { state: null, note: "newborn size" }, null, AT);
  expect(repo.all().marks["get-car-seat"]).toMatchObject({ state: null, how: null, note: "newborn size" });
  repo.mark("get-car-seat", { state: null, note: "  " }, null, AT);
  expect(repo.all().marks).toEqual({});
});

test("deleting a line deletes its mark; deleting a list, its lines and their marks", () => {
  const repo = new ListsRepo(db());
  const other = "33333333-3333-4333-8333-333333333333";
  repo.addList({ id: LIST, title: "Bunnings run" });
  repo.addLine({ id: LINE, listId: LIST, title: "Hooks" });
  repo.addLine({ id: other, listId: "baby", title: "Bouncer", section: "sleep" });
  repo.mark(LINE, { state: "got" });
  repo.mark(other, { state: "got" });
  repo.mark("get-car-seat", { state: "got" });
  repo.deleteList(LIST);
  expect(repo.all().ownLists).toEqual([]);
  expect(repo.all().ownLines.map((l) => l.id)).toEqual([other]);
  expect(Object.keys(repo.all().marks).sort()).toEqual([other, "get-car-seat"].sort());
  repo.deleteLine(other);
  expect(Object.keys(repo.all().marks)).toEqual(["get-car-seat"]);
});

test("a person forgotten leaves their lists, lines and marks, by nobody", () => {
  const people = new PeopleRepo(db());
  const sam = people.add("Sam", "carrying");
  const repo = new ListsRepo(db());
  repo.addList({ id: LIST, title: "Bunnings run" }, sam.id);
  repo.mark("get-car-seat", { state: "got" }, sam.id);
  db().run("DELETE FROM person WHERE id = ?", [sam.id]);
  expect(repo.all().ownLists[0]!.by).toBeNull();
  expect(repo.all().marks["get-car-seat"]!.by).toBeNull();
});

test("the store refuses a mark with nothing in it, and how without got", () => {
  expect(() => db().run("INSERT INTO list_mark (line_id, state, note, updated_at) VALUES ('a', NULL, NULL, 'x')")).toThrow(/CHECK/);
  expect(() => db().run("INSERT INTO list_mark (line_id, state, how, updated_at) VALUES ('a', 'arranged', 'bought', 'x')")).toThrow(/CHECK/);
});
