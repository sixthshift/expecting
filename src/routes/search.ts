// The search params each page takes, validated where the route is defined and
// read by the page through getRouteApi.

import { z } from "zod";
import { parseSlotKey } from "../lib/timeline";

/** Home: a week to open at instead of this one (`before`, `28`, `pp3`). */
export const homeSearch = z.object({
  at: z
    .string()
    .optional()
    .catch(undefined)
    .transform((key) => (key && parseSlotKey(key) ? key : undefined)),
});

/** The Library: what was typed in its search. */
export const librarySearch = z.object({ q: z.string().optional().catch(undefined) });

/** Login: why the last try failed, and where to go once in. */
export const loginSearch = z.object({ error: z.enum(["wrong", "locked"]).optional(), next: z.string().optional() });
