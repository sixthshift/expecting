import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { worlds } from "../../../app/features/quiet/worlds";
import { app } from "../../../routes/app";
import { timelineSearch } from "../features/timeline/routes/timeline";

/** `/`: home, This week: where you are and what matters now, or a peek at another week (?at=, the timeline's). */
export const thisWeek = createRoute({
  getParentRoute: () => app,
  path: "/",
  validateSearch: timelineSearch,
  component: worlds(
    lazyRouteComponent(() => import("../pages/ThisWeekPage"), "ThisWeekPage"),
    lazyRouteComponent(() => import("../quiet/pages/QuietThisWeekPage"), "QuietThisWeekPage")
  ),
});
