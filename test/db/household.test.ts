import { expect, test } from "vitest";
import { HouseholdRepo } from "../../src/db/models/household/repo";
import { useTestDb } from "./helpers";

const db = useTestDb();

test("empty until a date is entered", () => {
  expect(new HouseholdRepo(db()).get()).toEqual({ dueDate: null, birthDate: null });
});

test("updates change only the fields given", () => {
  const repo = new HouseholdRepo(db());
  repo.update({ dueDate: "2027-03-01" });
  repo.update({ birthDate: "2027-02-20" });
  expect(repo.get()).toEqual({ dueDate: "2027-03-01", birthDate: "2027-02-20" });
  repo.update({ birthDate: null });
  expect(repo.get()).toEqual({ dueDate: "2027-03-01", birthDate: null });
});

test("there is only ever one household row", () => {
  expect(() => db().run("INSERT INTO household (id, updated_at) VALUES (2, 'x')")).toThrow(/CHECK/);
});
