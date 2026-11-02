import { createRoute, redirect } from "@tanstack/react-router";
import { app } from "./app";

/** Where the collections were, as "records" (until 2026-11-02): kept so a link or a bookmark still lands. */
export const journalRecords = createRoute({
  getParentRoute: () => app,
  path: "/journal/records",
  beforeLoad: () => {
    throw redirect({ to: "/journal/collections", replace: true });
  },
});
