import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { worlds } from "../app/features/quiet/worlds";
import { app } from "./app";
import { librarySearch } from "./search";

/** The Library: its doors and topics (`?door=can-i`, `?topic=food`), and search (`?q=`). */
export const library = createRoute({
  getParentRoute: () => app,
  path: "/library",
  validateSearch: librarySearch,
  component: worlds(
    lazyRouteComponent(() => import("../pillars/library/pages/LibraryPage"), "LibraryPage"),
    lazyRouteComponent(() => import("../pillars/library/quiet/pages/QuietLibraryPage"), "QuietLibraryPage")
  ),
});
