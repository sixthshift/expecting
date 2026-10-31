import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { app } from "./app";

/** One item, to read on its own: from a search, a shelf, or a task's "Why". */
export const libraryItem = createRoute({
  getParentRoute: () => app,
  path: "/library/$itemId",
  // Its words before the page changes (and on a link's hover or press, by the router's preload).
  loader: async ({ params }) => (await import("../features/library/model/pageOf")).preloadPage(params.itemId),
  component: lazyRouteComponent(() => import("../features/library/pages/LibraryItemPage"), "LibraryItemPage"),
});
