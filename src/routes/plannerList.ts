import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { putAway } from "../app/features/quiet/putAway";
import { worlds } from "../app/features/quiet/worlds";
import { listBack } from "../lib/planner/lists/builtIn";
import { app } from "./app";

/** One list: a built-in one by its id (`baby`), one of yours by its UUID. */
export const plannerList = createRoute({
  getParentRoute: () => app,
  path: "/planner/lists/$listId",
  component: worlds(
    lazyRouteComponent(() => import("../pillars/planner/features/lists/pages/ListPage"), "ListPage"),
    putAway({ subject: "The lists", are: true, back: ({ listId = "" }) => listBack(listId) })
  ),
});
