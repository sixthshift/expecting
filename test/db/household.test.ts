import { expect, test } from "vitest";
import { HouseholdRepo } from "../../src/db/models/household/repo";
import { useTestDb } from "./helpers";

const db = useTestDb();

test("empty until a date is entered", () => {
  expect(new HouseholdRepo(db()).get()).toEqual({ dueDate: null, baby: "unknown", onboardedAt: null });
});

test("updates change only the fields given", () => {
  const repo = new HouseholdRepo(db());
  repo.update({ dueDate: "2027-03-01" });
  repo.update({ baby: "boy" });
  expect(repo.get()).toEqual({ dueDate: "2027-03-01", baby: "boy", onboardedAt: null });
  repo.update({ dueDate: null, baby: "girl", onboardedAt: null });
  expect(repo.get()).toEqual({ dueDate: null, baby: "girl", onboardedAt: null });
});

test("there is only ever one household row", () => {
  expect(() => db().run("INSERT INTO household (id, updated_at) VALUES (2, 'x')")).toThrow(/CHECK/);
});

test("the baby is boy, girl or unknown, and nothing else", () => {
  new HouseholdRepo(db()).update({ baby: "boy" });
  expect(() => db().run("UPDATE household SET baby = 'twins'")).toThrow(/CHECK/);
});
