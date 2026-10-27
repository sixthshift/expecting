import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { Route as appRoute } from "../app/route";

export const Route = createRoute({
  getParentRoute: () => appRoute,
  path: "/toolkit",
  component: lazyRouteComponent(() => import("./page"), "ToolkitPage"),
});
