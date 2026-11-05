import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { worlds } from "../../../app/features/quiet/worlds";
import { planner } from "./planner";

/** `/planner/appointments`: every appointment, the next first. While something has happened, the quiet Planner, which keeps them. */
export const appointments = createRoute({
  getParentRoute: () => planner,
  path: "appointments",
  component: worlds(
    lazyRouteComponent(() => import("../pages/AppointmentsPage"), "AppointmentsPage"),
    lazyRouteComponent(() => import("../quiet/pages/QuietPlannerPage"), "QuietPlannerPage")
  ),
});
