import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { appetiteQuery } from "../api/rpc/appetite";
import { feelingsQuery } from "../api/rpc/feelings";
import { firstsQuery } from "../api/rpc/firsts";
import { photosQuery } from "../api/rpc/photos";
import { app } from "./app";

/** The Journal's collections: everything kept, grouped by what it is, each with its answer at the top. */
export const journalCollections = createRoute({
  getParentRoute: () => app,
  path: "/journal/collections",
  // What the collections read beyond the frame's (the journal and the papers are the frame's).
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(feelingsQuery),
      queryClient.ensureQueryData(appetiteQuery),
      queryClient.ensureQueryData(photosQuery),
      queryClient.ensureQueryData(firstsQuery),
    ]),
  component: lazyRouteComponent(() => import("../features/journal/pages/CollectionsPage"), "CollectionsPage"),
});
