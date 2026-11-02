import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { app } from "./app";

/** The lists, the Planner's: what to get, a list for each purpose, with what's left on each. */
export const plannerLists = createRoute({
  getParentRoute: () => app,
  path: "/planner/lists",
  component: lazyRouteComponent(() => import("../pillars/planner/features/lists/pages/ListsPage"), "ListsPage"),
});
