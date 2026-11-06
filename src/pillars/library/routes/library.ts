import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { app } from "../../../routes/app";

/**
 * The Library's addresses, under `/library`, in its frame (`LibraryFrame`): the search at the top of every page in it,
 * kept as you go between them. Each page draws its own `PillarLayout` under it.
 */
export const library = createRoute({
  getParentRoute: () => app,
  path: "library",
  component: lazyRouteComponent(() => import("../components/search/LibraryFrame"), "LibraryFrame"),
});
