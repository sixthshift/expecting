import { expect, test } from "vitest";
import { JobsRepo } from "../../src/db/models/jobs/repo";
import { PeopleRepo } from "../../src/db/models/people/repo";
import { useTestDb } from "./helpers";

const db = useTestDb();
const AT = new Date("2026-11-01T00:00:00Z");

test("neither sees the other's answer to a job until both have answered it; only how many", () => {
  const people = new PeopleRepo(db());
  const jason = people.add("Jason", "partner");
  const repo = new JobsRepo(db());
  expect(repo.view(jason.id).together).toBe(false);
  const sam = people.add("Sam", "carrying");
  repo.pick("nappies", sam.id, "you", AT);
  repo.pick("washing", sam.id, "me", AT);

  const before = repo.view(jason.id);
  expect(before.together).toBe(true);
  expect(before.theirCount).toBe(2);
  expect(before.answers.find((a) => a.jobId === "nappies")).toEqual({ jobId: "nappies", mine: null, theirs: null });

  repo.pick("nappies", jason.id, "me", AT);
  expect(repo.view(jason.id).answers.find((a) => a.jobId === "nappies")).toEqual({ jobId: "nappies", mine: "me", theirs: "you" });
  expect(repo.view(sam.id).answers.find((a) => a.jobId === "washing")).toEqual({ jobId: "washing", mine: "me", theirs: null });
});

test("answered again, it's the new answer; taken back, the other's is hidden again", () => {
  const people = new PeopleRepo(db());
  const jason = people.add("Jason", "partner");
  const sam = people.add("Sam", "carrying");
  const repo = new JobsRepo(db());
  repo.pick("bills", sam.id, "me", AT);
  repo.pick("bills", jason.id, "together", AT);
  repo.pick("bills", jason.id, "you", AT);
  expect(repo.view(jason.id).answers.find((a) => a.jobId === "bills")).toMatchObject({ mine: "you", theirs: "me" });
  repo.unpick("bills", jason.id);
  expect(repo.view(jason.id).answers.find((a) => a.jobId === "bills")).toMatchObject({ mine: null, theirs: null });
});
