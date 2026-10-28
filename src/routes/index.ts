import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { app } from "./app";

/** `/`: home, This week: where you are and what matters now. */
export const index = createRoute({
  getParentRoute: () => app,
  path: "/",
  component: lazyRouteComponent(() => import("../features/home/Home"), "Home"),
});
