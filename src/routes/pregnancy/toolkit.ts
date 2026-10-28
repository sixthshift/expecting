import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { pregnancy } from ".";

/** The pregnancy's Toolkit. */
export const pregnancyToolkit = createRoute({
  getParentRoute: () => pregnancy,
  path: "/toolkit",
  component: lazyRouteComponent(() => import("../../features/phases/pregnancy/toolkit/Page"), "PregnancyToolkit"),
});
