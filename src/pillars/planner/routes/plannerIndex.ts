import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { feelingsQuery } from "../../../api/rpc/feelings";
import { listsQuery } from "../../../api/rpc/lists";
import { worlds } from "../../../app/features/quiet/worlds";
import { planner } from "./planner";

/** `/planner`: what to do, and what to ask. */
export const plannerIndex = createRoute({
  getParentRoute: () => planner,
  path: "/",
  // What the Planner reads beyond the frame's: there before it draws, and fetched ahead when the app warms the pillars (App).
  loader: ({ context: { queryClient } }) => Promise.all([queryClient.ensureQueryData(listsQuery), queryClient.ensureQueryData(feelingsQuery)]),
  component: worlds(
    lazyRouteComponent(() => import("../pages/PlannerPage"), "PlannerPage"),
    lazyRouteComponent(() => import("../quiet/pages/QuietPlannerPage"), "QuietPlannerPage")
  ),
});
