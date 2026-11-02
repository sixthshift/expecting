import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { appetiteQuery } from "../api/rpc/appetite";
import { feelingsQuery } from "../api/rpc/feelings";
import { app } from "./app";

/** The Journal's records: each kind kept, as a short answer and the lines behind it, to look up. */
export const journalRecords = createRoute({
  getParentRoute: () => app,
  path: "/journal/records",
  // What the records read beyond the frame's (the journal and the papers are the frame's).
  loader: ({ context: { queryClient } }) => Promise.all([queryClient.ensureQueryData(feelingsQuery), queryClient.ensureQueryData(appetiteQuery)]),
  component: lazyRouteComponent(() => import("../features/journal/pages/RecordsPage"), "RecordsPage"),
});
