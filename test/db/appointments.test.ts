import { expect, test } from "vitest";
import { AppointmentsRepo } from "../../src/db/models/appointments/repo";
import { PeopleRepo } from "../../src/db/models/people/repo";
import { useTestDb } from "./helpers";

const db = useTestDb();
const ID = "11111111-1111-4111-8111-111111111111";

test("an appointment is kept with what, when, where and notes, blank words as none, earliest first", () => {
  const sam = new PeopleRepo(db()).add("Sam", "carrying");
  const repo = new AppointmentsRepo(db());
  repo.add(
    { id: ID, title: "  20-week scan ", day: "2026-11-20", time: "09:15", place: "  ", notes: "Full bladder" },
    sam.id,
    new Date("2026-11-01T00:00:00Z")
  );
  repo.add({ id: crypto.randomUUID(), title: "Midwife", day: "2026-11-06", time: null }, null);
  expect(repo.list().map((a) => a.title)).toEqual(["Midwife", "20-week scan"]);
  expect(repo.list()[1]).toEqual({
    id: ID,
    title: "20-week scan",
    day: "2026-11-20",
    time: "09:15",
    place: null,
    notes: "Full bladder",
    by: sam.id,
    createdAt: "2026-11-01T00:00:00.000Z",
    editedBy: null,
    editedAt: null,
  });
});

test("the same save sent twice adds it once", () => {
  const repo = new AppointmentsRepo(db());
  repo.add({ id: ID, title: "Midwife", day: "2026-11-06", time: null }, null);
  repo.add({ id: ID, title: "Midwife", day: "2026-11-06", time: null }, null);
  expect(repo.list()).toHaveLength(1);
});

test("changed, it says who and when; deleted, it's gone", () => {
  const sam = new PeopleRepo(db()).add("Sam", "carrying");
  const repo = new AppointmentsRepo(db());
  repo.add({ id: ID, title: "Midwife", day: "2026-11-06", time: null, place: "Clinic" }, null);
  repo.edit({ id: ID, title: "Midwife", day: "2026-11-07", time: "10:30", place: "", notes: "Bring the referral" }, sam.id, new Date("2026-11-02T00:00:00Z"));
  expect(repo.list()[0]).toMatchObject({
    day: "2026-11-07",
    time: "10:30",
    place: null,
    notes: "Bring the referral",
    editedBy: sam.id,
    editedAt: "2026-11-02T00:00:00.000Z",
  });
  repo.delete(ID);
  expect(repo.list()).toEqual([]);
});

test("an appointment is something: a blank title is refused", () => {
  expect(() => new AppointmentsRepo(db()).add({ id: ID, title: "   ", day: "2026-11-06", time: null }, null)).toThrow();
});
