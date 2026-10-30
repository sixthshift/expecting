import { expect, test } from "vitest";
import { FactsRepo } from "../../src/db/models/facts/repo";
import { PeopleRepo } from "../../src/db/models/people/repo";
import { useTestDb } from "./helpers";

const db = useTestDb();
const at = (day: number) => new Date(Date.UTC(2026, 9, day));

test("nothing is known until something is answered", () => {
  expect(new FactsRepo(db()).latest()).toEqual([]);
});

test("the latest answer is the fact, for each question and whose it is", () => {
  const repo = new FactsRepo(db());
  repo.answer({ question: "booked", about: null, value: "not-yet", answeredBy: null }, at(1));
  repo.answer({ question: "work", about: "partner", value: "employee", answeredBy: null }, at(2));
  repo.answer({ question: "work", about: "carrying", value: "self-employed", answeredBy: null }, at(3));
  repo.answer({ question: "booked", about: null, value: "yes", answeredBy: null }, at(4));
  const latest = repo.latest();
  expect(latest).toHaveLength(3);
  expect(latest.find((a) => a.question === "booked")).toEqual({
    question: "booked",
    about: null,
    value: "yes",
    answeredBy: null,
    answeredAt: at(4).toISOString(),
  });
});

test("a skip or a clear is kept as an answer with no value", () => {
  const repo = new FactsRepo(db());
  repo.answer({ question: "cover", about: null, value: "yes", answeredBy: null }, at(1));
  repo.answer({ question: "cover", about: null, value: null, answeredBy: null }, at(2));
  expect(repo.latest()).toEqual([{ question: "cover", about: null, value: null, answeredBy: null, answeredAt: at(2).toISOString() }]);
});

test("an answer says who gave it", () => {
  const sam = new PeopleRepo(db()).add("Sam", "partner");
  const repo = new FactsRepo(db());
  repo.answer({ question: "cover", about: null, value: "no", answeredBy: sam.id });
  expect(repo.latest()[0]!.answeredBy).toBe(sam.id);
});

test("an answer is about one of you, or nobody in particular, and nothing else", () => {
  expect(() => db().run("INSERT INTO answer (id, question, about, value, answered_at) VALUES ('a', 'cover', 'baby', 'yes', 'x')")).toThrow(/CHECK/);
});
