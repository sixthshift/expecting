import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { namesQuery } from "../api/rpc/names";
import { app } from "./app";

/** The Drawer, with the names game's matches as this phone's person sees them. */
export const drawer = createRoute({
  getParentRoute: () => app,
  path: "/drawer",
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(namesQuery),
  component: lazyRouteComponent(() => import("../features/drawer/pages/DrawerPage"), "DrawerPage"),
});
