import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { z } from "zod";
import { worlds } from "../../../app/features/quiet/worlds";
import { TOPICS, type Topic, VERDICTS } from "../../../content/schema";
import { DOORS } from "../../../lib/library/doors";
import { library } from "./library";

/**
 * The Library's search: what was typed in its search; the door open (`can-i`), the topic (`food`), a can-i's verdict
 * (`avoid`), and `for=partner` to keep what's for the partner; and on a desktop the entry open in the reader over
 * it (`entry=rsv-vaccine`, `EntryReader`). Anything unknown is dropped.
 */
const librarySearch = z.object({
  q: z.string().optional().catch(undefined),
  door: z.enum(DOORS).optional().catch(undefined),
  topic: z
    .enum(Object.keys(TOPICS) as [Topic, ...Topic[]])
    .optional()
    .catch(undefined),
  verdict: z.enum(VERDICTS).optional().catch(undefined),
  for: z.literal("partner").optional().catch(undefined),
  entry: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .optional()
    .catch(undefined),
});

/** `/library`: its doors and topics (`?door=can-i`, `?topic=food`), search (`?q=`), and the reader (`?entry=`). */
export const libraryIndex = createRoute({
  getParentRoute: () => library,
  path: "/",
  validateSearch: librarySearch,
  component: worlds(
    lazyRouteComponent(() => import("../pages/LibraryPage"), "LibraryPage"),
    lazyRouteComponent(() => import("../quiet/pages/QuietLibraryPage"), "QuietLibraryPage")
  ),
});
