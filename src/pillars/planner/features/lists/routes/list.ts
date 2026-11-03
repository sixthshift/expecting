import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { putAway } from "../../../../../app/features/quiet/putAway";
import { worlds } from "../../../../../app/features/quiet/worlds";
import { listBack } from "../../../../../lib/planner/lists/builtIn";
import { lists } from "./lists";

/** One list: a built-in one by its id (`baby`), one of yours by its UUID. */
export const list = createRoute({
  getParentRoute: () => lists,
  path: "$listId",
  component: worlds(
    lazyRouteComponent(() => import("../pages/ListPage"), "ListPage"),
    putAway({ subject: "The lists", are: true, back: ({ listId = "" }) => listBack(listId) })
  ),
});
