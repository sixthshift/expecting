import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { appetiteQuery } from "../api/rpc/appetite";
import { feelingsQuery } from "../api/rpc/feelings";
import { photosQuery } from "../api/rpc/photos";
import { worlds } from "../app/features/quiet/worlds";
import { app } from "./app";
import { timelineSearch } from "./search";

/** The timeline: every week, opened at this one or at ?at=. */
export const timeline = createRoute({
  getParentRoute: () => app,
  path: "/timeline",
  validateSearch: timelineSearch,
  // What the timeline's weeks read beyond the frame's: there before it draws, and fetched ahead when the app warms the pillars (App).
  loader: ({ context: { queryClient } }) =>
    Promise.all([queryClient.ensureQueryData(photosQuery), queryClient.ensureQueryData(feelingsQuery), queryClient.ensureQueryData(appetiteQuery)]),
  component: worlds(
    lazyRouteComponent(() => import("../pillars/thisWeek/features/timeline/pages/TimelinePage"), "TimelinePage"),
    lazyRouteComponent(() => import("../pillars/thisWeek/features/timeline/quiet/pages/QuietTimelinePage"), "QuietTimelinePage")
  ),
});
