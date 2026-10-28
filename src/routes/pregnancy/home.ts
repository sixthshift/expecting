import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { homeSearch } from "../search";
import { pregnancy } from ".";

/** The pregnancy's home: the timeline, opened at this week or at ?at=. */
export const pregnancyHome = createRoute({
  getParentRoute: () => pregnancy,
  path: "/",
  validateSearch: homeSearch,
  component: lazyRouteComponent(() => import("../../features/phases/pregnancy/Home"), "PregnancyHome"),
});
