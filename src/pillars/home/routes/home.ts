import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { worlds } from "../../../app/features/quiet/worlds";
import { app } from "../../../routes/app";
import { timelineSearch } from "../features/timeline/routes/timeline";

/** `/`: Home: where you are and what matters now, or a peek at another week (?at=, the timeline's). */
export const home = createRoute({
  getParentRoute: () => app,
  path: "/",
  validateSearch: timelineSearch,
  component: worlds(
    lazyRouteComponent(() => import("../pages/HomePage"), "HomePage"),
    lazyRouteComponent(() => import("../quiet/pages/QuietHomePage"), "QuietHomePage")
  ),
});
