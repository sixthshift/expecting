import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { circleQuery } from "../api/rpc/circle";
import { putAway } from "../app/features/quiet/putAway";
import { worlds } from "../app/features/quiet/worlds";
import { app } from "./app";
import { peopleSearch } from "./search";

/** Your people, a page of its own from the Drawer, at one of its views. */
export const drawerPeople = createRoute({
  getParentRoute: () => app,
  path: "/drawer/people",
  validateSearch: peopleSearch,
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(circleQuery),
  component: worlds(
    lazyRouteComponent(() => import("../pillars/drawer/features/circle/pages/CirclePage"), "CirclePage"),
    putAway({
      subject: "Your people",
      are: true,
      back: { to: "/drawer", label: "The Drawer" },
      title: "Your people",
      lead: "The people around you two, and what each of them is doing. Only you two see it.",
      width: "3xl",
    })
  ),
});
