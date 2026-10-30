import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { app } from "./app";
import { journalSearch } from "./search";

/** The Journal: the story, in a lens, zoomed, at a week, with what was just kept. */
export const journal = createRoute({
  getParentRoute: () => app,
  path: "/journal",
  validateSearch: journalSearch,
  component: lazyRouteComponent(() => import("../features/journal/pages/JournalPage"), "JournalPage"),
});
