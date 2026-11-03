import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { circleQuery } from "../../../api/rpc/circle";
import { jobsQuery } from "../../../api/rpc/jobs";
import { namesQuery } from "../../../api/rpc/names";
import { putAway } from "../../../app/features/quiet/putAway";
import { worlds } from "../../../app/features/quiet/worlds";
import { drawer } from "./drawer";

/** `/drawer`: the Drawer, with the names game's matches as this phone's person sees them, and your people. */
export const drawerIndex = createRoute({
  getParentRoute: () => drawer,
  path: "/",
  loader: ({ context: { queryClient } }) =>
    Promise.all([queryClient.ensureQueryData(namesQuery), queryClient.ensureQueryData(circleQuery), queryClient.ensureQueryData(jobsQuery)]),
  component: worlds(
    lazyRouteComponent(() => import("../pages/DrawerPage"), "DrawerPage"),
    putAway({
      subject: "The names and everything else here",
      are: true,
      title: "Drawer",
      lead: "The handy things, kept where you can find them when their moment comes.",
    })
  ),
});
