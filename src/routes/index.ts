import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { worlds } from "../app/features/quiet/worlds";
import { app } from "./app";
import { thisWeekSearch } from "./search";

/** `/`: home, This week: where you are and what matters now, or a peek at another week (?at=). */
export const index = createRoute({
  getParentRoute: () => app,
  path: "/",
  validateSearch: thisWeekSearch,
  component: worlds(
    lazyRouteComponent(() => import("../pillars/thisWeek/pages/ThisWeekPage"), "ThisWeekPage"),
    lazyRouteComponent(() => import("../pillars/thisWeek/quiet/pages/QuietThisWeekPage"), "QuietThisWeekPage")
  ),
});
