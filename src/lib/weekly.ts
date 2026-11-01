// A question a week (docs/plan-extras.md, part 3): one question for the two of
// you each week, each answered on your own phone. Neither sees the other's
// answer to a week's question until both have given one (as Who does what,
// src/lib/jobs.ts); then both are in the Journal, under the week. This week's
// question is on This week; an earlier one can still be answered, found when
// you look for it, never counted or chased. Kept on trust: who's holding the
// phone is a choice, not a login.

import type { ISODate } from "./dates";
import type { Week } from "./timeline";

/**
 * The questions, by week. About the two of you and what's ahead: never her
 * body, never the baby's sex, never a first baby assumed. A week's question
 * is its key: rewording one keeps its answers.
 */
export const WEEKLY: Partial<Record<Week, string>> = {
  4: "How did you feel in the first minute you knew?",
  5: "Who do you most want to tell, and why them?",
  6: "What's one thing about your life now you want to hold on to?",
  7: "What are you most looking forward to?",
  8: "What's one thing you're quietly nervous about?",
  9: "What did the people who raised you get right?",
  10: "What would you do differently from how you were raised?",
  11: "What's a smell, song or place from your own childhood you'd like them to know?",
  12: "What do you think they'll get from you?",
  13: "What do you think they'll get from the other one of you?",
  14: "What's a small family tradition you'd like to start?",
  15: "What does a good Sunday look like in a year's time?",
  16: "What's something you're looking forward to teaching them?",
  17: "What are you hoping to learn from them?",
  18: "Who in your life do you hope they'll be close to?",
  19: "What's the best advice anyone's given you about this so far?",
  20: "What's the worst advice?",
  21: "What's one thing you'd like the other of you to know you're grateful for?",
  22: "What will you miss about it being just the two of you?",
  23: "What won't you miss?",
  24: "What book, film or show do you want to share with them one day?",
  25: "How do you want to handle the hard days, as a team?",
  26: "What's something you'd like to say to them now, before you've met?",
  27: "What do you hope home feels like to them?",
  28: "What's one thing you'd like to do together before they arrive?",
  29: "What do you want to remember about this time?",
  30: "What's a promise you'd like to make to them?",
  31: "How will you look after each other in the first weeks?",
  32: "What's one thing the other of you does that will make a great parent?",
  33: "What are you most curious about: who they'll look like, or who they'll be?",
  34: "What's a name you loved that didn't make the list, and why?",
  35: "How do you want to spend the last weekend before?",
  36: "What do you want to say to each other on the day?",
  37: "What's the first thing you want to show them?",
  38: "What will you want to remember about today?",
  39: "What are you ready for? What are you not?",
  40: "Anything you want to say to each other, now it's close?",
  41: "Still waiting. How are you holding up, honestly?",
};

/** The weeks with a question, in order. */
export const WEEKLY_WEEKS = (Object.keys(WEEKLY).map(Number) as Week[]).sort((a, b) => a - b);

export function questionOf(week: number): string | undefined {
  return WEEKLY[week as Week];
}

/** One of you's answer to a week's question. */
export type WeeklyAnswer = { body: string; by: string; answeredAt: string };

/** A week's question as this phone sees it: your answer, and the other's only once you've both answered. */
export type WeeklyWeek = { week: Week; mine: WeeklyAnswer | null; theirs: WeeklyAnswer | null };

/** What the server shows this phone: each week either of you has answered, as above. */
export type WeeklyView = { weeks: WeeklyWeek[] };

/** A week both have answered: in the Journal, on the day the second answer came. */
export type WeeklyPair = { week: Week; question: string; answers: WeeklyAnswer[]; day: ISODate };

/** The weeks both of you have answered, each with its question and the day it was revealed. */
export function pairs(view: WeeklyView, dayOf: (at: string) => ISODate): WeeklyPair[] {
  return view.weeks.flatMap((w) => {
    const question = questionOf(w.week);
    if (!question || !w.mine || !w.theirs) return [];
    const answers = [w.mine, w.theirs].sort((a, b) => a.answeredAt.localeCompare(b.answeredAt));
    return [{ week: w.week, question, answers, day: dayOf(answers[1]!.answeredAt) }];
  });
}

/** A week's question as this phone has it, answered or not. */
export function weekOf(view: WeeklyView, week: Week): WeeklyWeek {
  return view.weeks.find((w) => w.week === week) ?? { week, mine: null, theirs: null };
}

/** The questions of weeks before `now`, newest first: still to be answered whenever you like, never counted. */
export function earlier(now: Week): Week[] {
  return WEEKLY_WEEKS.filter((w) => w < now).reverse();
}
