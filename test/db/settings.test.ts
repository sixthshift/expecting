import { expect, test } from "vitest";
import { SettingsRepo } from "../../src/db/models/settings/repo";
import { useTestDb } from "./helpers";

const db = useTestDb();

test("empty until a date is entered", () => {
  expect(new SettingsRepo(db()).get()).toEqual({ dueDate: null, baby: "unknown", onboardedAt: null });
});

test("updates change only the fields given", () => {
  const repo = new SettingsRepo(db());
  repo.update({ dueDate: "2027-03-01" });
  repo.update({ baby: "boy" });
  expect(repo.get()).toEqual({ dueDate: "2027-03-01", baby: "boy", onboardedAt: null });
  repo.update({ dueDate: null, baby: "girl", onboardedAt: null });
  expect(repo.get()).toEqual({ dueDate: null, baby: "girl", onboardedAt: null });
});

test("there is only ever one settings row", () => {
  expect(() => db().run("INSERT INTO settings (id, updated_at) VALUES (2, 'x')")).toThrow(/CHECK/);
});

test("the baby is boy, girl or unknown, and nothing else", () => {
  new SettingsRepo(db()).update({ baby: "boy" });
  expect(() => db().run("UPDATE settings SET baby = 'twins'")).toThrow(/CHECK/);
});
