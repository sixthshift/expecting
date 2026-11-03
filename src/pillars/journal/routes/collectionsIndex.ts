import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { collections } from "./collections";

/** `/journal/collections`: everything kept, grouped by what it is, each with its answer at the top. */
export const collectionsIndex = createRoute({
  getParentRoute: () => collections,
  path: "/",
  component: lazyRouteComponent(() => import("../pages/CollectionsPage"), "CollectionsPage"),
});
