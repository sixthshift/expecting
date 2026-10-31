import { expect, test } from "vitest";
import { type CirclePerson, groupsOf, mealTrain, patched, rosterText, round, toThank, VISITS, viewsOn } from "../../src/lib/circle";

const person = (name: string, more: Partial<CirclePerson> = {}): CirclePerson => ({
  id: name,
  name,
  note: null,
  visit: null,
  hears: null,
  help: null,
  mealDay: null,
  by: null,
  createdAt: "2026-11-01T00:00:00.000Z",
  ...more,
});

test("a view only for its extra, in order", () => {
  expect(viewsOn(new Set())).toEqual([]);
  expect(viewsOn(new Set(["thank-you-notes", "visitors", "nursery"]))).toEqual(["visitors", "gifts"]);
});

test("a view's groups: each value's people by name, then the undecided, none empty", () => {
  const people = [person("rob", { visit: "not-yet" }), person("Ellie"), person("priya", { visit: "hospital" }), person("Dad", { visit: "hospital" })];
  expect(groupsOf(people, VISITS, (p) => p.visit).map((g) => [g.title, g.people.map((p) => p.name)])).toEqual([
    ["In hospital", ["Dad", "priya"]],
    ["Not yet", ["rob"]],
    ["Not decided", ["Ellie"]],
  ]);
});

test("the meal train by day, and as text for the organiser", () => {
  const people = [person("Jo", { mealDay: "2027-02-05", help: "lasagne" }), person("Ana", { mealDay: "2027-02-03" }), person("Kim")];
  expect(mealTrain(people).map((p) => p.name)).toEqual(["Ana", "Jo"]);
  expect(rosterText(people, (d) => d.slice(5))).toBe("02-03: Ana\n02-05: Jo (lasagne)");
});

test("who hears in a round, and the gifts still to thank for", () => {
  expect(round([person("B", { hears: "first" }), person("a", { hears: "first" }), person("c", { hears: "next" })], "first").map((p) => p.name)).toEqual([
    "a",
    "B",
  ]);
  const gift = (id: string, thankedAt: string | null) => ({ id, personId: "x", what: id, thankedAt, by: null, createdAt: "" });
  expect(toThank([gift("pram", null), gift("rug", "2026-12-01")]).map((g) => g.id)).toEqual(["pram"]);
});

test("a change keeps what it doesn't set; empty words and a day that isn't one are none", () => {
  const p = person("Mum", { visit: "hospital", help: "washing" });
  expect(patched(p, { hears: "first" })).toMatchObject({ visit: "hospital", hears: "first", help: "washing" });
  expect(patched(p, { help: "  ", mealDay: "soon" as never })).toMatchObject({ help: null, mealDay: null });
});
