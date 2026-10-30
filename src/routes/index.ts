import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { app } from "./app";
import { thisWeekSearch } from "./search";

/** `/`: home, This week: where you are and what matters now, or a peek at another week (?at=). */
export const index = createRoute({
  getParentRoute: () => app,
  path: "/",
  validateSearch: thisWeekSearch,
  component: lazyRouteComponent(() => import("../features/thisWeek/pages/ThisWeek"), "ThisWeek"),
});
