import { expect, test } from "vitest";
import { EmergencyRepo } from "../../src/db/models/emergency/repo";
import { PeopleRepo } from "../../src/db/models/people/repo";
import { useTestDb } from "./helpers";

const db = useTestDb();
const at = (day: number) => new Date(Date.UTC(2026, 9, day));

test("an empty page has no values and no change", () => {
  expect(new EmergencyRepo(db()).get()).toEqual({ values: {}, changed: null });
});

test("fields are saved, changed and cleared, and the page says who changed it last", () => {
  const people = new PeopleRepo(db());
  const jason = people.add("Jason", "partner");
  const sam = people.add("Sam", "carrying");
  const repo = new EmergencyRepo(db());

  repo.set({ birthSuitePhone: "02 9999 0000", bloodGroup: "O negative" }, jason.id, at(1));
  repo.set({ bloodGroup: "O positive", birthSuitePhone: "02 9999 0000" }, sam.id, at(2));
  expect(repo.get()).toEqual({
    values: { birthSuitePhone: "02 9999 0000", bloodGroup: "O positive" },
    changed: { by: sam.id, at: at(2).toISOString() },
  });

  // Saving the same value again isn't a change.
  repo.set({ bloodGroup: "O positive" }, jason.id, at(3));
  expect(repo.get().changed).toEqual({ by: sam.id, at: at(2).toISOString() });

  repo.set({ birthSuitePhone: "" }, jason.id, at(4));
  expect(repo.get().values).toEqual({ bloodGroup: "O positive" });
});
