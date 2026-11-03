import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { library } from "./library";

/** One item, to read on its own: from a search, a shelf, or a task's "Why". */
export const item = createRoute({
  getParentRoute: () => library,
  path: "$itemId",
  // Its words before the page changes (and on a link's hover or press, by the router's preload).
  loader: async ({ params }) => (await import("../model/pageOf")).preloadPage(params.itemId),
  component: lazyRouteComponent(() => import("../pages/LibraryItemPage"), "LibraryItemPage"),
});
