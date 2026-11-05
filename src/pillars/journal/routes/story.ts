import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { z } from "zod";
import { appetiteQuery } from "../../../api/rpc/appetite";
import { feelingsQuery } from "../../../api/rpc/feelings";
import { firstsQuery } from "../../../api/rpc/firsts";
import { listsQuery } from "../../../api/rpc/lists";
import { namesQuery } from "../../../api/rpc/names";
import { photosQuery } from "../../../api/rpc/photos";
import { worlds } from "../../../app/features/quiet/worlds";
import { STORY_VIEWS } from "../../../lib/journal/story/views";
import { timelineSearch } from "../../home/features/timeline/routes/timeline";
import { journal } from "./journal";

/**
 * The Journal's search: the way the story is looked at (`weeks`, `photos`; days has
 * none), and a week to open at (`22`, as the timeline's). Anything unknown
 * is dropped.
 */
const journalSearch = z.object({
  view: z.enum(STORY_VIEWS).optional().catch(undefined),
  at: timelineSearch.shape.at,
});

/** `/journal`: the story, in a view, zoomed, at a week. */
export const story = createRoute({
  getParentRoute: () => journal,
  path: "/",
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
    lazyRouteComponent(() => import("../pages/JournalPage"), "JournalPage"),
    lazyRouteComponent(() => import("../quiet/pages/QuietJournalPage"), "QuietJournalPage")
  ),
});
