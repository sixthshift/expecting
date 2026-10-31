// The questions Expecting asks, from facts.data.ts, and the rules for
// what your answers, the facts, do to an item. Pure, and bundled into the
// client like the items.
//
// A question is asked once (`cover`), or of each of you (`work`), so a fact's
// key is the question's id, or the id and whose it is: `work.carrying`,
// `work.partner`.

import { z } from "zod";
import { isISODate } from "../../../lib/dates";
import type { Role } from "../../../lib/people";
import { WEEKS } from "../../../lib/timeline";
import { QUESTION_LIST } from "./facts.data";

/** Where settings shows a question, in this order. */
export const GROUPS = {
  pregnancy: "The pregnancy",
  care: "Care and the birth",
  work: "Work and leave",
  after: "After the birth",
} as const;

export type Group = keyof typeof GROUPS;

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "answers are lower-case words joined by hyphens");

/** For each fact, the answers something is for: `{ cover: [no, unsure] }`. */
export type When = Record<string, string[]>;

/** A `when` as written: one answer, or several. */
export type WhenInput = Readonly<Record<string, string | readonly string[]>>;

export const whenSchema = z
  .record(z.string(), z.union([z.string(), z.array(z.string()).min(1)]))
  .transform((w): When => Object.fromEntries(Object.entries(w).map(([q, a]) => [q, typeof a === "string" ? [a] : a])));

const questionSchema = z
  .object({
    /** Also its name in content, as `$id`: so one word. */
    id: z.string().regex(/^[a-z][a-zA-Z0-9]*$/, "a question id is one camelCase word, so content can write it as $id"),
    /** About each of you, `{name}` is whose it is: "Does {name} work?" */
    ask: z.string().min(1),
    /** Where settings shows it. */
    group: z.enum(Object.keys(GROUPS) as [Group, ...Group[]]),
    /** Also asked in the first-run questions, not only in settings. */
    asked: z.literal("onboarding").optional(),
    /** The pregnancy week This week asks it: again, if still unanswered or `unsure`. */
    week: z.number().int().min(WEEKS.first).max(WEEKS.last).optional(),
    /** A choice of `answers`, or a date. */
    type: z.enum(["choice", "date"]).default("choice"),
    /** Asked of each of you, not once. */
    each: z.boolean().default(false),
    /** Asked only when the answers so far fit, as an item's `when`. In a question about each of you, `work` is the same person's. */
    when: whenSchema.default({}),
    answers: z.record(slug, z.string().min(1)).default({}),
    /** Answers asked again later, like `unsure`: what can change (a baby that isn't head-first can turn). */
    askAgain: z.array(slug).default([]),
  })
  .strict()
  .superRefine((q, ctx) => {
    const n = Object.keys(q.answers).length;
    if (q.type === "choice" && n < 2) ctx.addIssue({ code: "custom", path: ["answers"], message: "a question needs at least two answers" });
    if (q.type === "date" && n > 0) ctx.addIssue({ code: "custom", path: ["answers"], message: "a date question has no answers to choose from" });
    if (q.each && !q.ask.includes("{name}")) ctx.addIssue({ code: "custom", path: ["ask"], message: "a question about each of you says whose with {name}" });
    for (const a of q.askAgain) if (!(a in q.answers)) ctx.addIssue({ code: "custom", path: ["askAgain"], message: `"${a}" is not one of its answers` });
    if (q.askAgain.length > 0 && q.week === undefined)
      ctx.addIssue({ code: "custom", path: ["askAgain"], message: "only a question with a week is asked again" });
  });

export type FactQuestion = z.output<typeof questionSchema>;

/** A question as facts.data.ts writes it; checked by `parseFacts`. */
export type QuestionInput = {
  readonly id: string;
  readonly ask: string;
  readonly group: Group;
  readonly asked?: "onboarding";
  readonly week?: number;
  readonly type?: "choice" | "date";
  readonly each?: boolean;
  readonly when?: WhenInput;
  readonly answers?: Readonly<Record<string, string>>;
  readonly askAgain?: readonly string[];
};

/** A question's id, as facts.data.ts has it. */
export type QuestionId = (typeof QUESTION_LIST)[number]["id"];

/** Whose a fact is: one of you, or null for one asked once. */
export type About = Role | null;

/** The facts: a key (`cover`, `work.partner`) to its answer, or a date as YYYY-MM-DD. A fact not in it is unknown. */
export type Facts = Record<string, string>;

/** One question as asked of one subject: `work` of the partner is `work.partner`. */
export type Ask = { key: string; question: FactQuestion; about: About };

const EACH: readonly Role[] = ["carrying", "partner"];

/** "Not sure yet": an answer, kept, that hides nothing. */
export const UNSURE = "unsure";

export function factKey(id: string, about: About): string {
  return about === null ? id : `${id}.${about}`;
}

/** The questions, checked. Throws on a bad question, a repeated id or a `when` that names nothing. */
export function parseFacts(list: readonly unknown[]): FactQuestion[] {
  const questions = z.array(questionSchema).parse(list);
  const byId = new Map<string, FactQuestion>();
  for (const q of questions) {
    if (byId.has(q.id)) throw new Error(`question "${q.id}" appears twice`);
    byId.set(q.id, q);
  }
  for (const q of questions) {
    const problems = checkWhen(q.when, (id) => byId.get(id), q.each);
    if (problems.length > 0) throw new Error(`${q.id}: ${problems.join("; ")}`);
  }
  return questions;
}

export const QUESTIONS: readonly FactQuestion[] = parseFacts(QUESTION_LIST);

const byId = new Map(QUESTIONS.map((q) => [q.id, q]));

export function question(id: QuestionId): FactQuestion;
export function question(id: string): FactQuestion | undefined;
export function question(id: string): FactQuestion | undefined {
  return byId.get(id);
}

/** Every question as asked: once, or once for each of you, in the file's order. */
export const ASKS: readonly Ask[] = QUESTIONS.flatMap((q): Ask[] =>
  q.each ? EACH.map((r) => ({ key: factKey(q.id, r), question: q, about: r })) : [{ key: q.id, question: q, about: null }]
);

const asks = new Map(ASKS.map((a) => [a.key, a]));

/** The question and subject a key names, or undefined. */
export function ask(key: string): Ask | undefined {
  return asks.get(key);
}

/** Whether `value` answers the fact `key`: one of its answers, or a date. */
export function isAnswer(key: string, value: string): boolean {
  const q = ask(key)?.question;
  if (!q) return false;
  return q.type === "date" ? isISODate(value) : Object.hasOwn(q.answers, value);
}

/** Facts still meaning something: drops any whose question or answer has since left the list. */
export function cleanFacts(facts: Facts): Facts {
  return Object.fromEntries(Object.entries(facts).filter(([k, v]) => isAnswer(k, v)));
}

/**
 * The problems with a `when`: each key a choice question (with whose, if it
 * is about each of you, unless `sameOne` lets the asking person stand in),
 * and each answer one of its own.
 */
export function checkWhen(when: When, find: (id: string) => FactQuestion | undefined = question, sameOne = false): string[] {
  const problems: string[] = [];
  for (const [key, answers] of Object.entries(when)) {
    const [id = "", whose, ...rest] = key.split(".");
    const q = find(id);
    if (!q) {
      problems.push(`"${id}" is not a question`);
      continue;
    }
    if (q.type !== "choice") problems.push(`"${id}" is a date, not a choice`);
    if (!q.each && whose !== undefined) problems.push(`"${id}" is asked once, so it is "${id}", not "${key}"`);
    if (q.each && (rest.length > 0 || (whose === undefined ? !sameOne : !EACH.includes(whose as Role)))) {
      problems.push(`"${id}" is asked of each of you: say whose, as "${id}.carrying" or "${id}.partner"`);
    }
    for (const a of answers) {
      if (a === UNSURE) problems.push(`"${a}" hides nothing, so nothing is written against it: leave ${id} out for everyone`);
      else if (!Object.hasOwn(q.answers, a)) problems.push(`"${a}" is not an answer to ${id}`);
    }
  }
  return problems;
}

/**
 * Whether something is for you. Every condition must hold, and a
 * fact not yet known, or not sure, holds: tailoring only hides on a definite answer. `about`
 * is the person a question is asked of, for a bare `work` in its `when`.
 */
export function applies(when: When, facts: Facts, about: About = null): boolean {
  return Object.entries(when).every(([key, answers]) => {
    const value = facts[key] ?? (about === null ? undefined : facts[factKey(key, about)]);
    return value === undefined || value === UNSURE || answers.includes(value);
  });
}

/** The facts as content's variables: `$cover`, and `$work.partner` for one about each of you. */
export function variables(facts: Facts): Record<string, string | Record<string, string>> {
  const vars: Record<string, string | Record<string, string>> = {};
  for (const [key, value] of Object.entries(facts)) {
    const [id = "", whose] = key.split(".");
    if (whose === undefined) vars[id] = value;
    else vars[id] = { ...(vars[id] as Record<string, string> | undefined), [whose]: value };
  }
  return vars;
}

/** The question in words, for whoever it's about: "Does Sam work?", or "Does the partner work?" before Sam has joined. */
export function askedOf(a: Ask, name: string | null): string {
  if (a.about === null) return a.question.ask;
  return a.question.ask.replaceAll("{name}", name ?? (a.about === "carrying" ? "the pregnant parent" : "the partner"));
}
