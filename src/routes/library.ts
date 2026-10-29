import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { app } from "./app";
import { librarySearch } from "./search";

/** The Library: its shelves, and search (`?q=`). */
export const library = createRoute({
  getParentRoute: () => app,
  path: "/library",
  validateSearch: librarySearch,
  component: lazyRouteComponent(() => import("../features/library/pages/LibraryPage"), "LibraryPage"),
});
