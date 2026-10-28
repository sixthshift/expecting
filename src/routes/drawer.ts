import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { app } from "./app";

/** The Drawer. */
export const drawer = createRoute({
  getParentRoute: () => app,
  path: "/drawer",
  component: lazyRouteComponent(() => import("../features/drawer/DrawerPage"), "DrawerPage"),
});
