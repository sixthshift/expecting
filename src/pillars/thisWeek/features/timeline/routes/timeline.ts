import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { z } from "zod";
import { appetiteQuery } from "../../../../../api/rpc/appetite";
import { feelingsQuery } from "../../../../../api/rpc/feelings";
import { photosQuery } from "../../../../../api/rpc/photos";
import { worlds } from "../../../../../app/features/quiet/worlds";
import { parseWeekKey } from "../../../../../lib/timeline";
import { app } from "../../../../../routes/app";

/** The timeline's search: a week to open at instead of this one (`28`). */
export const timelineSearch = z.object({
  at: z
    // The router reads `?at=28` as the number 28, and anything else as a string.
    .union([z.string(), z.number().transform(String)])
    .optional()
    .catch(undefined)
    // A week, 1–42; anything else opens at this week.
    .transform((key) => (key ? (parseWeekKey(key) ?? undefined) : undefined)),
});

/** The timeline: every week, opened at this one or at ?at=. */
export const timeline = createRoute({
  getParentRoute: () => app,
  path: "timeline",
  validateSearch: timelineSearch,
  // What the timeline's weeks read beyond the frame's: there before it draws, and fetched ahead when the app warms the pillars (App).
  loader: ({ context: { queryClient } }) =>
    Promise.all([queryClient.ensureQueryData(photosQuery), queryClient.ensureQueryData(feelingsQuery), queryClient.ensureQueryData(appetiteQuery)]),
  component: worlds(
    lazyRouteComponent(() => import("../pages/TimelinePage"), "TimelinePage"),
    lazyRouteComponent(() => import("../quiet/pages/QuietTimelinePage"), "QuietTimelinePage")
  ),
});
