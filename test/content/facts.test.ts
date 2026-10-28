import { describe, expect, test } from "vitest";
import { ASKS, applies, ask, askedOf, checkWhen, cleanFacts, isAnswer, parseFacts, QUESTIONS, variables } from "../../src/content/facts";

describe("content/facts.yaml", () => {
  test("loads, every question with answers or a date", () => {
    expect(QUESTIONS.length).toBeGreaterThan(0);
    expect(isAnswer("cover", "yes")).toBe(true);
    expect(isAnswer("cover", "maybe")).toBe(false);
    expect(isAnswer("leaveStart.partner", "2027-01-04")).toBe(true);
    expect(isAnswer("leaveStart.partner", "soon")).toBe(false);
  });

  test("a question about each of you is asked once for each", () => {
    expect(ASKS.filter((a) => a.question.id === "work").map((a) => a.key)).toEqual(["work.carrying", "work.partner"]);
    expect(ask("work")).toBeUndefined();
    expect(ask("cover.partner")).toBeUndefined();
  });

  test.each([
    ["a repeated id", "- { id: a, ask: A, answers: { x: X, y: Y } }\n- { id: a, ask: B, answers: { x: X, y: Y } }", /appears twice/],
    ["one answer", "- { id: a, ask: A, answers: { x: X } }", /at least two answers/],
    ["an id content can't name", "- { id: first-baby, ask: A, answers: { x: X, y: Y } }", /camelCase/],
    ["a week past the pregnancy", "- { id: a, ask: A, week: 43, answers: { x: X, y: Y } }", /42/],
    ["a date with answers", "- { id: a, ask: A, type: date, answers: { x: X, y: Y } }", /no answers/],
    ["one about each that names nobody", "- { id: a, ask: Do you work?, about: each, answers: { x: X, y: Y } }", /\{name\}/],
    ["a when on nothing", "- { id: a, ask: A, when: { b: x }, answers: { x: X, y: Y } }", /"b" is not a question/],
  ])("rejects %s", (_name, text, message) => {
    expect(() => parseFacts(text)).toThrow(message);
  });
});

describe("checkWhen", () => {
  test("a question about each of you says whose", () => {
    expect(checkWhen({ "work.partner": ["employee"] })).toEqual([]);
    expect(checkWhen({ work: ["employee"] })[0]).toMatch(/say whose/);
    expect(checkWhen({ "work.baby": ["employee"] })[0]).toMatch(/say whose/);
  });

  test("the household's has no whose, a date is not a choice, and answers are its own", () => {
    expect(checkWhen({ "cover.partner": ["yes"] })[0]).toMatch(/household's/);
    expect(checkWhen({ "leaveStart.partner": ["2027-01-04"] })[0]).toMatch(/date/);
    expect(checkWhen({ cover: ["maybe"] })[0]).toMatch(/not an answer/);
    expect(checkWhen({ cover: ["no", "unsure"] })[0]).toMatch(/hides nothing/);
  });
});

describe("applies", () => {
  const when = { cover: ["no"] };

  test("an item with no conditions is for everyone", () => {
    expect(applies({}, { cover: "yes" })).toBe(true);
  });

  test("an unknown fact hides nothing", () => {
    expect(applies(when, {})).toBe(true);
  });

  test("not sure hides nothing either", () => {
    expect(applies(when, { cover: "unsure" })).toBe(true);
  });

  test("a definite answer decides", () => {
    expect(applies(when, { cover: "no" })).toBe(true);
    expect(applies(when, { cover: "yes" })).toBe(false);
  });

  test("every condition must hold", () => {
    expect(applies({ ...when, state: ["vic"] }, { cover: "no", state: "nsw" })).toBe(false);
  });

  test("in a question about each of you, a bare fact is the same person's", () => {
    const facts = { "work.carrying": "employee", "work.partner": "not-working" };
    expect(applies({ work: ["employee"] }, facts, "carrying")).toBe(true);
    expect(applies({ work: ["employee"] }, facts, "partner")).toBe(false);
  });
});

test("facts whose question or answer has gone are dropped", () => {
  expect(cleanFacts({ cover: "yes", mood: "happy", state: "atlantis", "work.partner": "employee" })).toEqual({ cover: "yes", "work.partner": "employee" });
});

test("content reads a fact about each of you by whose it is", () => {
  expect(variables({ cover: "yes", "work.partner": "employee", "work.carrying": "self-employed" })).toEqual({
    cover: "yes",
    work: { partner: "employee", carrying: "self-employed" },
  });
});

test("a question about each of you names them, or says which of you before they've joined", () => {
  const work = ask("work.partner")!;
  expect(askedOf(work, "Sam")).toBe("Does Sam work?");
  expect(askedOf(work, null)).toBe("Does the partner work?");
});
