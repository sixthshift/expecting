import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { appetiteQuery } from "../api/rpc/appetite";
import { feelingsQuery } from "../api/rpc/feelings";
import { firstsQuery } from "../api/rpc/firsts";
import { listsQuery } from "../api/rpc/lists";
import { namesQuery } from "../api/rpc/names";
import { photosQuery } from "../api/rpc/photos";
import { worlds } from "../app/features/quiet/worlds";
import { app } from "./app";
import { journalSearch } from "./search";

/** The Journal: the story, in a view, zoomed, at a week. */
export const journal = createRoute({
  getParentRoute: () => app,
  path: "/journal",
  validateSearch: journalSearch,
  // What the Journal reads beyond the frame's, side by side: there before it draws, and fetched ahead when the app warms the pillars (App).
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(photosQuery),
      queryClient.ensureQueryData(feelingsQuery),
      queryClient.ensureQueryData(appetiteQuery),
      queryClient.ensureQueryData(firstsQuery),
      queryClient.ensureQueryData(listsQuery),
      queryClient.ensureQueryData(namesQuery),
    ]),
  component: worlds(
    lazyRouteComponent(() => import("../pillars/journal/pages/JournalPage"), "JournalPage"),
    lazyRouteComponent(() => import("../pillars/journal/quiet/pages/QuietJournalPage"), "QuietJournalPage")
  ),
});
