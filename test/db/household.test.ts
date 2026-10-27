import { expect, test } from "vitest";
import { HouseholdRepo } from "../../src/db/models/household/repo";
import { useTestDb } from "./helpers";

const db = useTestDb();

test("empty until a date is entered", () => {
  expect(new HouseholdRepo(db()).get()).toEqual({ dueDate: null, birthDate: null, baby: "unknown", profile: {}, onboardedAt: null });
});

test("updates change only the fields given", () => {
  const repo = new HouseholdRepo(db());
  repo.update({ dueDate: "2027-03-01" });
  repo.update({ birthDate: "2027-02-20" });
  expect(repo.get()).toEqual({ dueDate: "2027-03-01", birthDate: "2027-02-20", baby: "unknown", profile: {}, onboardedAt: null });
  repo.update({ birthDate: null, baby: "girl", profile: {}, onboardedAt: null });
  expect(repo.get()).toEqual({ dueDate: "2027-03-01", birthDate: null, baby: "girl", profile: {}, onboardedAt: null });
});

test("there is only ever one household row", () => {
  expect(() => db().run("INSERT INTO household (id, updated_at) VALUES (2, 'x')")).toThrow(/CHECK/);
});

test("the baby is boy, girl or unknown, and nothing else", () => {
  new HouseholdRepo(db()).update({ baby: "boy" });
  expect(() => db().run("UPDATE household SET baby = 'twins'")).toThrow(/CHECK/);
});

test("answers are set and cleared one at a time", () => {
  const repo = new HouseholdRepo(db());
  repo.answer("cover", "no");
  repo.answer("state", "vic");
  repo.answer("cover", null);
  expect(repo.get().profile).toEqual({ state: "vic" });
});

test("the profile is always a JSON object", () => {
  expect(() => db().run("INSERT INTO household (id, updated_at, profile) VALUES (1, 'x', '[]')")).toThrow(/CHECK/);
});
