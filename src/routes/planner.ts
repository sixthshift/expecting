import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { app } from "./app";

/** The Planner: what to do, and what to ask. */
export const planner = createRoute({
  getParentRoute: () => app,
  path: "/planner",
  component: lazyRouteComponent(() => import("../features/planner/PlannerPage"), "PlannerPage"),
});
