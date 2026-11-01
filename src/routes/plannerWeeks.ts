import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { app } from "./app";
import { plannerWeeksSearch } from "./search";

/** The Planner's chart: what's to do across the weeks, opened at a stage (`?stage=32`) or at the top. */
export const plannerWeeks = createRoute({
  getParentRoute: () => app,
  path: "/planner/weeks",
  validateSearch: plannerWeeksSearch,
  component: lazyRouteComponent(() => import("../features/planner/pages/WeeksPage"), "WeeksPage"),
});
