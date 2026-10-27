import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { getHousehold } from "../../server/functions/household";
import { Route as rootRoute } from "../root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  loader: () => getHousehold(),
  component: lazyRouteComponent(() => import("./page"), "SettingsPage"),
});
