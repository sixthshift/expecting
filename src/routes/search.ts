// The search params each page takes, validated where the route is defined and
// read by the page through getRouteApi.

import { z } from "zod";
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

/** The Library: what was typed in its search. */
export const librarySearch = z.object({ q: z.string().optional().catch(undefined) });

/** Onboarding: the step just answered, to go on from. */
export const onboardingSearch = z.object({ after: z.string().optional().catch(undefined) });

/** Login: where to go once in. */
export const loginSearch = z.object({ next: z.string().optional() });
