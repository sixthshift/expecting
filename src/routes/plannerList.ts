import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { app } from "./app";

/** One list: a built-in one by its id (`baby`), one of yours by its UUID. */
export const plannerList = createRoute({
  getParentRoute: () => app,
  path: "/planner/lists/$listId",
  component: lazyRouteComponent(() => import("../features/lists/pages/ListPage"), "ListPage"),
});
