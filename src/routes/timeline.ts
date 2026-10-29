import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { app } from "./app";
import { timelineSearch } from "./search";

/** The timeline: every week, opened at this one or at ?at=. */
export const timeline = createRoute({
  getParentRoute: () => app,
  path: "/timeline",
  validateSearch: timelineSearch,
  component: lazyRouteComponent(() => import("../features/timeline/pages/TimelinePage"), "TimelinePage"),
});
