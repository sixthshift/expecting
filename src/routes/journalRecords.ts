import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { appetiteQuery } from "../api/rpc/appetite";
import { feelingsQuery } from "../api/rpc/feelings";
import { app } from "./app";
import { recordsSearch } from "./search";

/** The Journal's records: what's kept, said in a few lines, to look up; one kind at full size (`?show=`). */
export const journalRecords = createRoute({
  getParentRoute: () => app,
  path: "/journal/records",
  validateSearch: recordsSearch,
  // What the records read beyond the frame's (the journal and the papers are the frame's).
  loader: ({ context: { queryClient } }) => Promise.all([queryClient.ensureQueryData(feelingsQuery), queryClient.ensureQueryData(appetiteQuery)]),
  component: lazyRouteComponent(() => import("../features/journal/pages/RecordsPage"), "RecordsPage"),
});
