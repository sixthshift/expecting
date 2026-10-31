import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { feelingsQuery } from "../api/rpc/feelings";
import { listsQuery } from "../api/rpc/lists";
import { app } from "./app";

/** The Planner: what to do, and what to ask. */
export const planner = createRoute({
  getParentRoute: () => app,
  path: "/planner",
  // What the Planner reads beyond the frame's: there before it draws, and fetched ahead when the app warms the pillars (App).
  loader: ({ context: { queryClient } }) => Promise.all([queryClient.ensureQueryData(listsQuery), queryClient.ensureQueryData(feelingsQuery)]),
  component: lazyRouteComponent(() => import("../features/planner/pages/PlannerPage"), "PlannerPage"),
});
