import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { timelineSearch } from "../search";
import { pregnancy } from ".";

/** The pregnancy's timeline: every week, opened at this one or at ?at=. */
export const pregnancyTimeline = createRoute({
  getParentRoute: () => pregnancy,
  path: "/timeline",
  validateSearch: timelineSearch,
  component: lazyRouteComponent(() => import("../../features/phases/pregnancy/timeline/Page"), "PregnancyTimeline"),
});
