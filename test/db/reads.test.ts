import { expect, test } from "vitest";
import { PeopleRepo } from "../../src/db/models/people/repo";
import { ReadsRepo } from "../../src/db/models/reads/repo";
import { useTestDb } from "./helpers";

const db = useTestDb();

test("each of you has your own reads, and the first time an entry was opened is kept", () => {
  const people = new PeopleRepo(db());
  const sam = people.add("Sam", "carrying");
  const jason = people.add("Jason", "partner");
  const repo = new ReadsRepo(db());
  repo.markRead(sam.id, "rsv-vaccine", "2026-11-01T09:00:00.000Z");
  repo.markRead(sam.id, "rsv-vaccine", "2026-11-02T09:00:00.000Z");
  expect(repo.reads(sam.id)).toEqual({ "rsv-vaccine": "2026-11-01T09:00:00.000Z" });
  expect(repo.reads(jason.id)).toEqual({});
});
