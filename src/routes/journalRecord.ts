import { createRoute, redirect } from "@tanstack/react-router";
import { app } from "./app";

/** Where one collection was, as a record (until 2026-11-02): `/journal/records/movements` is `/journal/collections/movements`. */
export const journalRecord = createRoute({
  getParentRoute: () => app,
  path: "/journal/records/$kind",
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/journal/collections/$name", params: { name: params.kind }, replace: true });
  },
});
