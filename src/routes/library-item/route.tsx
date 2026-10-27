import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { Route as appRoute } from "../app/route";

/** One item, to read on its own: from a search, a shelf, or a task's "Why". */
export const Route = createRoute({
  getParentRoute: () => appRoute,
  path: "/library/$itemId",
  component: lazyRouteComponent(() => import("./page"), "LibraryItemPage"),
});
