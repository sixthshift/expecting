// Home while something has happened: the guide's parts it shows, the
// week the timeline paused at, and the next steps offered. Pure, tested
// apart from the screen.

import type { Item } from "../../content/schema";
import { type ISODate, todayISO } from "../dates";
import type { Quiet, QuietKind } from "../quiet";
import { positionOn, type Week } from "../timeline";

/**
 * The guide's `##` parts Home shows while it's quiet, after its opening
 * lines: how a loss feels and what it does to your body are a loss's alone.
 */
export const QUIET_PARTS: Record<QuietKind, readonly string[]> = {
  loss: ["Someone to talk to", "Your body", "How you might feel"],
  news: ["Someone to talk to"],
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
