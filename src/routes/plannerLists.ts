import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { putAway } from "../app/features/quiet/putAway";
import { worlds } from "../app/features/quiet/worlds";
import { app } from "./app";

/** The lists, the Planner's: what to get, a list for each purpose, with what's left on each. */
export const plannerLists = createRoute({
  getParentRoute: () => app,
  path: "/planner/lists",
  component: worlds(
    lazyRouteComponent(() => import("../pillars/planner/features/lists/pages/ListsPage"), "ListsPage"),
    putAway({
      subject: "The lists",
      are: true,
      back: { to: "/planner", label: "Planner" },
      title: "Lists",
      lead: "What to get, a list for each part of getting ready, ticked off together wherever you are.",
    })
  ),
});
