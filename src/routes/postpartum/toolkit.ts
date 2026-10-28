import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { postpartum } from ".";

/** The newborn's Toolkit. */
export const postpartumToolkit = createRoute({
  getParentRoute: () => postpartum,
  path: "/toolkit",
  component: lazyRouteComponent(() => import("../../features/phases/postpartum/toolkit/Page"), "PostpartumToolkit"),
});
