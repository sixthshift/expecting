import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { app } from "./app";

/** The Journal. */
export const journal = createRoute({
  getParentRoute: () => app,
  path: "/journal",
  component: lazyRouteComponent(() => import("../features/journal/JournalPage"), "JournalPage"),
});
