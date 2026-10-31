import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { circleQuery } from "../api/rpc/circle";
import { app } from "./app";
import { peopleSearch } from "./search";

/** Your people, a page of its own from the Drawer, at one of its views. */
export const drawerPeople = createRoute({
  getParentRoute: () => app,
  path: "/drawer/people",
  validateSearch: peopleSearch,
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(circleQuery),
  component: lazyRouteComponent(() => import("../features/circle/pages/PeoplePage"), "PeoplePage"),
});
