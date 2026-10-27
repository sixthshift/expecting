import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { Route as appRoute } from "../app/route";

export const Route = createRoute({
  getParentRoute: () => appRoute,
  path: "/journal",
  component: lazyRouteComponent(() => import("./page"), "JournalPage"),
});
