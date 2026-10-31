import { expect, test } from "vitest";
import { CircleRepo } from "../../src/db/models/circle/repo";
import { PeopleRepo } from "../../src/db/models/people/repo";
import { useTestDb } from "./helpers";

const db = useTestDb();

const MUM = "11111111-1111-4111-8111-111111111111";
const PRAM = "22222222-2222-4222-8222-222222222222";
const AT = new Date("2026-11-01T00:00:00Z");
const LATER = new Date("2026-12-01T00:00:00Z");

test("someone added by the phone's id, once however often it's sent, renamed, with words trimmed", () => {
  const sam = new PeopleRepo(db()).add("Sam", "carrying");
  const repo = new CircleRepo(db());
  repo.addPerson({ id: MUM, name: " Mum ", note: " " }, sam.id, AT);
  repo.addPerson({ id: MUM, name: "Again", note: null }, null, AT);
  expect(repo.all().people).toEqual([
    { id: MUM, name: "Mum", note: null, visit: null, hears: null, help: null, mealDay: null, by: sam.id, createdAt: AT.toISOString() },
  ]);
  repo.renamePerson(MUM, { name: "Mum (Jo)", note: " Sam's mum " });
  expect(repo.person(MUM)).toMatchObject({ name: "Mum (Jo)", note: "Sam's mum" });
});

test("each view sets its own thing, and leaves the rest", () => {
  const repo = new CircleRepo(db());
  repo.addPerson({ id: MUM, name: "Mum", note: null }, null, AT);
  repo.setPerson(MUM, { visit: "hospital" });
  repo.setPerson(MUM, { hears: "first", help: " the school run " });
  repo.setPerson(MUM, { mealDay: "2027-02-03" });
  expect(repo.person(MUM)).toMatchObject({ visit: "hospital", hears: "first", help: "the school run", mealDay: "2027-02-03" });
  repo.setPerson(MUM, { help: "", visit: null });
  expect(repo.person(MUM)).toMatchObject({ visit: null, hears: "first", help: null, mealDay: "2027-02-03" });
});

test("a gift thanked keeps its first day; deleting someone takes their gifts", () => {
  const repo = new CircleRepo(db());
  repo.addPerson({ id: MUM, name: "Mum", note: null }, null, AT);
  repo.addGift({ id: PRAM, personId: MUM, what: " the pram " }, null, AT);
  repo.addGift({ id: PRAM, personId: MUM, what: "again" }, null, AT);
  repo.thankGift(PRAM, true, AT);
  repo.thankGift(PRAM, true, LATER);
  expect(repo.all().gifts).toEqual([{ id: PRAM, personId: MUM, what: "the pram", thankedAt: AT.toISOString(), by: null, createdAt: AT.toISOString() }]);
  repo.thankGift(PRAM, false, LATER);
  expect(repo.all().gifts[0]?.thankedAt).toBeNull();
  repo.deletePerson(MUM);
  expect(repo.all()).toMatchObject({ people: [], gifts: [] });
});

test("the words for the birth: written, rewritten, and gone when emptied", () => {
  const repo = new CircleRepo(db());
  expect(repo.all().announcement).toBeNull();
  repo.setAnnouncement(" She's here! ", null, AT);
  repo.setAnnouncement("He's here!", null, LATER);
  expect(repo.all().announcement).toEqual({ body: "He's here!", by: null, updatedAt: LATER.toISOString() });
  repo.setAnnouncement("  ");
  expect(repo.all().announcement).toBeNull();
});
