import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { circleQuery } from "../api/rpc/circle";
import { jobsQuery } from "../api/rpc/jobs";
import { namesQuery } from "../api/rpc/names";
import { app } from "./app";

/** The Drawer, with the names game's matches as this phone's person sees them, and your people. */
export const drawer = createRoute({
  getParentRoute: () => app,
  path: "/drawer",
  loader: ({ context: { queryClient } }) =>
    Promise.all([queryClient.ensureQueryData(namesQuery), queryClient.ensureQueryData(circleQuery), queryClient.ensureQueryData(jobsQuery)]),
  component: lazyRouteComponent(() => import("../features/drawer/pages/DrawerPage"), "DrawerPage"),
});
