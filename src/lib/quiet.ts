// Something has happened: a loss, or hard news that turns everything over.
// While it stands Expecting is quiet for both of you: no countdown,
// no sizes, nothing to do, only support and the next steps when you want
// them. Pure, tested apart from the screen.

import type { Item, Task } from "../content/schema";
import { type ISODate, todayISO } from "./dates";
import { positionOn, type Week } from "./timeline";

/** What has happened: a loss, or news that changes everything but the pregnancy goes on (a worrying result, a baby in intensive care). */
export const QUIET_KINDS = ["loss", "news"] as const;

export type QuietKind = (typeof QUIET_KINDS)[number];

/** Expecting is quiet: why, who said so, and when. */
export type Quiet = { kind: QuietKind; setBy: string | null; setAt: string };

/** The guide that says what this is, and where it can be switched on as well as in Settings. */
export const QUIET_ITEM = "something-has-happened";

/**
 * The guide's `##` parts This week shows while it's quiet, after its opening
 * lines: how a loss feels and what it does to your body are a loss's alone.
 */
export const QUIET_PARTS: Record<QuietKind, readonly string[]> = {
  loss: ["Someone to talk to", "Your body", "How you might feel"],
  news: ["Someone to talk to"],
};

/** What each kind is called where you choose it. */
export const QUIET_LABELS: Record<QuietKind, { choose: string; detail: string }> = {
  loss: { choose: "We've lost the baby", detail: "A miscarriage, a stillbirth, or a baby who has died." },
  news: { choose: "We've had hard news", detail: "A worrying result, a baby in intensive care: the pregnancy goes on, but not as it was." },
};

/**
 * Whether `next` may follow what has already happened. Hard news can become a
 * loss; a loss never becomes hard news, and saying the same again changes nothing.
 */
export function canBecome(current: Quiet | null, next: QuietKind): boolean {
  if (current === null) return true;
  return current.kind === "news" && next === "loss";
}

/**
 * What each kind can bring back. Hard news brings the weeks back as they were;
 * a loss can only be undone as a mistake, since there's no pregnancy to resume.
 */
export const WAY_BACK: Record<QuietKind, string> = {
  news: "Bring the weeks back",
  loss: "This was set by mistake",
};

/** The week the timeline paused at: the week it was when something happened. Null without a due date. */
export function pausedAt(quiet: Quiet, dueDate: ISODate | null): Week | null {
  return dueDate ? positionOn(todayISO(new Date(quiet.setAt)), dueDate).week : null;
}

/**
 * The next steps, one at a time, whenever you want them, in the order they
 * tend to come up: what happens now, the choices, who to call, work, ways to
 * remember, the people around you, and later on.
 */
export const NEXT_STEPS: Record<QuietKind, readonly string[]> = {
  loss: [
    "after-a-miscarriage",
    "late-miscarriage",
    "stillbirth",
    "neonatal-death",
    "miscarriage-management-options",
    "loss-support-services",
    "loss-and-work",
    "leave-after-loss",
    "remembering-the-baby",
    "supporting-someone-after-a-loss",
    "partner-after-a-loss",
    "grief-and-anniversaries",
    "pregnancy-after-loss",
  ],
  news: [
    "high-chance-result",
    "screening-vs-diagnostic",
    "genetic-counselling",
    "cvs",
    "amniocentesis",
    "told-higher-risk",
    "termination-for-medical-reasons",
    "waters-breaking-early",
    "when-the-baby-comes-early",
    "baby-in-the-nicu",
  ],
};

/**
 * The next steps for what happened at `week`: those in your library (tailored
 * and extras), and among them only those whose weeks hold it, so a miscarriage
 * at 8 weeks isn't offered stillbirth. Without a week, all of them.
 */
export function nextSteps(items: readonly Item[], kind: QuietKind, week: Week | null): Item[] {
  const byId = new Map(items.map((i) => [i.id, i]));
  return NEXT_STEPS[kind]
    .map((id) => byId.get(id))
    .filter((i): i is Item => i !== undefined && (week === null || i.from === null || (i.from <= week && week <= i.to)));
}

/**
 * What you'd already set in motion when the to-do list was put aside: the
 * ticked tasks. Claims (an item about money and leave) may still matter;
 * the rest (bookings, classes, orders) you might want to cancel.
 */
export function setInMotion(tasks: readonly Task[], ticks: Readonly<Record<string, string>>, items: readonly Item[]): { claims: Task[]; bookings: Task[] } {
  const payments = new Set(items.filter((i) => i.type === "payment").map((i) => i.id));
  const done = tasks.filter((t) => ticks[t.id]);
  return {
    claims: done.filter((t) => t.itemId !== null && payments.has(t.itemId)),
    bookings: done.filter((t) => t.itemId === null || !payments.has(t.itemId)),
  };
}
