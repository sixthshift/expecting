import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { app } from "./app";

/** One item, to read on its own: from a search, a shelf, or a task's "Why". The same in every phase. */
export const libraryItem = createRoute({
  getParentRoute: () => app,
  path: "/library/$itemId",
  component: lazyRouteComponent(() => import("../features/library/LibraryItemPage"), "LibraryItemPage"),
});
