import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { pregnancy } from ".";

/** The pregnancy's home: this week, where you are and what matters now. */
export const pregnancyHome = createRoute({
  getParentRoute: () => pregnancy,
  path: "/",
  component: lazyRouteComponent(() => import("../../features/phases/pregnancy/Home"), "PregnancyHome"),
});
