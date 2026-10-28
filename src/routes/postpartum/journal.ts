import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { postpartum } from ".";

/** The newborn's Journal. */
export const postpartumJournal = createRoute({
  getParentRoute: () => postpartum,
  path: "/journal",
  component: lazyRouteComponent(() => import("../../features/phases/postpartum/journal/Page"), "PostpartumJournal"),
});
