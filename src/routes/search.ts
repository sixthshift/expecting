// The search params each page takes, validated where the route is defined and
// read by the page through getRouteApi.

import { z } from "zod";
import { TOPICS, type Topic, VERDICTS } from "../content/schema";
import { VIEW_KEYS, type View } from "../lib/circle";
import { DOORS } from "../lib/library";
import { DECK_FILTERS } from "../lib/names";
import { LENSES } from "../lib/story";
import { parseWeekKey } from "../lib/timeline";

/** The timeline: a week to open at instead of this one (`28`). */
export const timelineSearch = z.object({
  at: z
    // The router reads `?at=28` as the number 28, and anything else as a string.
    .union([z.string(), z.number().transform(String)])
    .optional()
    .catch(undefined)
    // A week, 1–42; anything else opens at this week.
    .transform((key) => (key ? (parseWeekKey(key) ?? undefined) : undefined)),
});

/** This week: a week to peek at instead (`29`), the same way. */
export const thisWeekSearch = timelineSearch;

/**
 * The Library: what was typed in its search; the door open (`can-i`), the topic (`food`), a can-i's verdict
 * (`avoid`), and `for=partner` to keep what's for the partner. Anything unknown is dropped.
 */
export const librarySearch = z.object({
  q: z.string().optional().catch(undefined),
  door: z.enum(DOORS).optional().catch(undefined),
  topic: z
    .enum(Object.keys(TOPICS) as [Topic, ...Topic[]])
    .optional()
    .catch(undefined),
  verdict: z.enum(VERDICTS).optional().catch(undefined),
  for: z.literal("partner").optional().catch(undefined),
});

/**
 * The Journal: the lens (`photos`), how far it's zoomed out (`weeks`,
 * `pregnancy`), a week to open at (`22`, as the timeline's), and what the
 * "+" just kept (its id), shown first. Anything unknown is dropped.
 */
export const journalSearch = z.object({
  show: z.enum(LENSES).optional().catch(undefined),
  zoom: z.enum(["weeks", "pregnancy"]).optional().catch(undefined),
  at: timelineSearch.shape.at,
  kept: z.string().max(100).optional().catch(undefined),
});

/** Settings: a question to open at (`cover`, `work.partner`). */
export const settingsSearch = z.object({ ask: z.string().optional().catch(undefined) });

/** Onboarding: the step just answered, to go on from. */
export const onboardingSearch = z.object({ after: z.string().optional().catch(undefined) });

/** Login: where to go once in. */
export const loginSearch = z.object({ next: z.string().optional() });

/** Your people: which view (`visitors`, `hearing`, `help`, `gifts`); without, the first that's on. */
export const peopleSearch = z.object({
  view: z
    .enum(VIEW_KEYS as [View, ...View[]])
    .optional()
    .catch(undefined),
});

/** The names game: which names it deals (`girls`, `boys`, `all`); without, all of them. Only while you don't know which it is: knowing, the deck is that one's. */
export const namesSearch = z.object({
  names: z.enum(DECK_FILTERS).optional().catch(undefined),
});
