import { expect, test } from "vitest";
import { JOBS, outcomes, said, toAnswer, turned, waiting } from "../../src/lib/jobs";

const answer = (jobId: string, mine: "me" | "you" | "together" | null, theirs: "me" | "you" | "together" | null = null) => ({ jobId, mine, theirs });

test("every job's id is its own", () => {
  expect(new Set(JOBS.map((j) => j.id)).size).toBe(JOBS.length);
});

test("the other's answer, turned to where you stand", () => {
  expect([turned("me"), turned("you"), turned("together")]).toEqual(["you", "me", "together"]);
});

test("settled when you both say the same person, from where each of you stands; to talk about otherwise", () => {
  const result = outcomes([
    answer("nappies", "me", "you"), // I'll do it; they say I will
    answer("washing", "together", "together"),
    answer("night-wakes", "me", "me"), // both of us say "me"
    answer("bills", "you", "you"), // both of us say the other
    answer("cooking", "me"), // not yet answered by them
  ]);
  expect(result.map((o) => [o.job.id, o.agreed ? o.who : `${o.mine}/${o.theirs}`])).toEqual([
    ["night-wakes", "me/you"],
    ["nappies", "me"],
    ["washing", "together"],
    ["bills", "you/me"],
  ]);
});

test("the deck is what you haven't answered, in order; and what waits for the other", () => {
  const answers = [answer("night-wakes", "me"), answer("nappies", "you", "me")];
  expect(toAnswer(answers)[0]?.id).toBe("night-feeds");
  expect(toAnswer(answers)).toHaveLength(JOBS.length - 2);
  expect(waiting(answers)).toBe(1);
});

test("an answer in words", () => {
  expect([said("me", "Sam"), said("you", "Sam"), said("together", "Sam")]).toEqual(["You", "Sam", "Together"]);
});
