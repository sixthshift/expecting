// What the household's answers become: its facts, the questions This week
// asks again, and a task's deadline counted back from a date it gave. Pure,
// tested apart from the screen.

import { ASKS, type Ask, applies, cleanFacts, type FactQuestion, type Facts, factKey, UNSURE } from "../content/facts";
import type { Task } from "../content/schema";
import { addDays, type ISODate, todayISO } from "./dates";
import type { Role } from "./people";
import { positionOn, WEEKS, type Week } from "./timeline";

/** One answer as the app reads it: null when skipped or cleared. */
export type Answer = { question: string; about: "household" | Role; value: string | null; answeredBy: string | null; answeredAt: string };

/** A question answered `unsure` comes back this many weeks later, not every week. */
export const ASK_AGAIN_AFTER = 4;

export function keyOf(a: Pick<Answer, "question" | "about">): string {
  return factKey(a.question, a.about);
}

/** The latest answer to each question, by fact key. */
export function latestByKey(answers: readonly Answer[]): Record<string, Answer> {
  return Object.fromEntries(answers.map((a) => [keyOf(a), a]));
}

/** What the household has said: each latest answer that is still an answer. */
export function factsOf(answers: readonly Answer[]): Facts {
  return cleanFacts(Object.fromEntries(answers.filter((a) => a.value !== null).map((a) => [keyOf(a), a.value!])));
}

/** Whether a question is asked of this household at all: its own `when`, on what has been said so far. */
export function isAsked(a: Ask, facts: Facts): boolean {
  return applies(a.question.when, facts, a.about);
}

/** Every question this household is asked, in order. */
export function asksFor(facts: Facts): Ask[] {
  return ASKS.filter((a) => isAsked(a, facts));
}

function isDefinite(q: FactQuestion, value: string | null | undefined): boolean {
  return value != null && !(q.type === "choice" && value === UNSURE);
}

/**
 * The questions This week asks: those whose week has come, still unknown or
 * `unsure`. One answered (or skipped) before its week comes back at its week;
 * one answered `unsure`, or skipped, since then comes back ASK_AGAIN_AFTER
 * weeks later, not every week.
 */
export function questionsDue({ answers, now, dueDate }: { answers: readonly Answer[]; now: Week; dueDate: ISODate }): Ask[] {
  const facts = factsOf(answers);
  const latest = latestByKey(answers);
  return asksFor(facts).filter((a) => {
    const { week } = a.question;
    if (week === undefined || now < week) return false;
    const last = latest[a.key];
    if (!last) return true;
    if (isDefinite(a.question, facts[a.key])) return false;
    const answeredIn = positionOn(todayISO(new Date(last.answeredAt)), dueDate).week;
    return answeredIn < week || now >= answeredIn + ASK_AGAIN_AFTER;
  });
}

/**
 * A task with its deadline counted back from a date the household gave
 * (`deadlineFrom`): whose date is the task's `who`, the earlier of the two for
 * one you do together. Its best-by and opening weeks move up to meet an
 * earlier deadline. Without the date, or a due date, the written weeks stand.
 */
export function timeTask(task: Task, facts: Facts, dueDate: ISODate | null): Task {
  if (!task.deadlineFrom || !dueDate) return task;
  const { fact, weeks } = task.deadlineFrom;
  const whose: Role[] = task.who === "together" ? ["carrying", "partner"] : [task.who];
  const dates = whose.map((r) => facts[factKey(fact, r)]).filter((d): d is string => d !== undefined) as ISODate[];
  if (dates.length === 0) return task;
  const by = [...dates].sort()[0]!;
  const deadline = Math.max(WEEKS.first, positionOn(addDays(by, -7 * weeks), dueDate).week);
  const due = Math.min(task.due, deadline);
  return { ...task, deadline, due, opens: Math.min(task.opens, due) };
}
