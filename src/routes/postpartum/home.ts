import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { postpartum } from ".";

/** The baby's here: this week. */
export const postpartumHome = createRoute({
  getParentRoute: () => postpartum,
  path: "/",
  component: lazyRouteComponent(() => import("../../features/phases/postpartum/Home"), "PostpartumHome"),
});
