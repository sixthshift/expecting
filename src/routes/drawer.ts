import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { getNames } from "../api/rpc/names";
import { app } from "./app";

/** The Drawer, with the names game as this phone's person sees it. */
export const drawer = createRoute({
  getParentRoute: () => app,
  path: "/drawer",
  loader: () => getNames(),
  component: lazyRouteComponent(() => import("../features/drawer/DrawerPage"), "DrawerPage"),
});
