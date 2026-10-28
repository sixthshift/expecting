import { type AnyRoute, createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { librarySearch } from "./search";

/**
 * The pages every phase has, under that phase (`/pregnancy/library`): one
 * page each, tuned by the phase's app (usePhaseApp), so each phase's routes
 * are built here from the one definition.
 */
export function sharedRoutes<P extends AnyRoute>(phase: P) {
  const library = createRoute({
    getParentRoute: () => phase,
    path: "/library",
    validateSearch: librarySearch,
    component: lazyRouteComponent(() => import("../features/library/LibraryPage"), "LibraryPage"),
  });
  /** One item, to read on its own: from a search, a shelf, or a task's "Why". */
  const libraryItem = createRoute({
    getParentRoute: () => phase,
    path: "/library/$itemId",
    component: lazyRouteComponent(() => import("../features/library/LibraryItemPage"), "LibraryItemPage"),
  });
  const planner = createRoute({
    getParentRoute: () => phase,
    path: "/planner",
    component: lazyRouteComponent(() => import("../features/planner/PlannerPage"), "PlannerPage"),
  });
  return [library, libraryItem, planner] as const;
}
