import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { pregnancy } from ".";

/** The pregnancy's Journal. */
export const pregnancyJournal = createRoute({
  getParentRoute: () => pregnancy,
  path: "/journal",
  component: lazyRouteComponent(() => import("../../features/phases/pregnancy/journal/Page"), "PregnancyJournal"),
});
