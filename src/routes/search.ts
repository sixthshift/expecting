// The search params each page takes, validated where the route is defined and
// read by the page through getRouteApi.

import { z } from "zod";
import { TOPICS, type Topic, VERDICTS } from "../content/schema";
import { VIEW_KEYS, type View } from "../lib/circle";
import { DOORS } from "../lib/library";
import { DECK_FILTERS } from "../lib/names";
import { stageEnding } from "../lib/planner";
import { RECORDS } from "../lib/records";
import { STORY_LENSES } from "../lib/story/views";
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
 * `pregnancy`), and a week to open at (`22`, as the timeline's). Anything
 * unknown is dropped.
 */
export const journalSearch = z.object({
  show: z.enum(STORY_LENSES).optional().catch(undefined),
  zoom: z.enum(["weeks", "pregnancy"]).optional().catch(undefined),
  at: timelineSearch.shape.at,
});

/** The Journal's records: one kind open at full size (`movements`, `appetite`, `feelings`, `papers`), or all of them in a few lines. */
export const recordsSearch = z.object({ show: z.enum(RECORDS).optional().catch(undefined) });

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

/** Pregnancy bingo: your card, or the other's. */
export const bingoSearch = z.object({ card: z.enum(["theirs"]).optional().catch(undefined) });

/** The names game: which names it deals (`girls`, `boys`, `all`); without, all of them. Only while you don't know which it is: knowing, the deck is that one's. */
export const namesSearch = z.object({
  names: z.enum(DECK_FILTERS).optional().catch(undefined),
});

/** The Planner's chart: a stage to open at, by the week it ends (`32`); anything else opens at the top. */
export const plannerWeeksSearch = z.object({
  stage: z.coerce
    .number()
    .int()
    .optional()
    .catch(undefined)
    .transform((end) => (end !== undefined && stageEnding(end) ? end : undefined)),
});

/** A value the router may have read as a number or a boolean (`?state=123`), back to the string it was sent as. */
const raw = z
  .union([z.string(), z.number().transform(String), z.boolean().transform(String)])
  .optional()
  .catch(undefined);

/** Connecting a client: an OAuth authorisation request, as sent. The page judges it (`authorisation`, src/lib/connect.ts). */
export const connectSearch = z.object({
  response_type: raw,
  client_id: raw,
  redirect_uri: raw,
  code_challenge: raw,
  code_challenge_method: raw,
  state: raw,
  scope: raw,
  resource: raw,
});
