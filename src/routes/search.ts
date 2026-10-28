// The search params each page takes, validated where the route is defined and
// read by the page through getRouteApi.

import { z } from "zod";
import { parseSlotKey, slotKey } from "../lib/timeline";

/** Home: a week to open at instead of this one (`preconception`, `28`, `pp3`). */
export const homeSearch = z.object({
  at: z
    // The router reads `?at=28` as the number 28: a pregnancy week's key arrives as a number.
    .union([z.string(), z.number().transform(String)])
    .optional()
    .catch(undefined)
    // Read as a slot and written back as its key, so an old alias (`before`) opens as `preconception`.
    .transform((key) => {
      const slot = key ? parseSlotKey(key) : null;
      return slot ? slotKey(slot) : undefined;
    }),
});

/** The Library: what was typed in its search. */
export const librarySearch = z.object({ q: z.string().optional().catch(undefined) });

/** Onboarding: the step just answered, to go on from. */
export const onboardingSearch = z.object({ after: z.string().optional().catch(undefined) });

/** Login: where to go once in. */
export const loginSearch = z.object({ next: z.string().optional() });
