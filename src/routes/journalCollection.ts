import { createRoute, lazyRouteComponent, redirect } from "@tanstack/react-router";
import { appetiteQuery } from "../api/rpc/appetite";
import { feelingsQuery } from "../api/rpc/feelings";
import { firstsQuery } from "../api/rpc/firsts";
import { photosQuery } from "../api/rpc/photos";
import { isCollection } from "../lib/story/collections";
import { app } from "./app";

/** One of the Journal's collections, all of it: `/journal/collections/photos`; any other name is the collections. */
export const journalCollection = createRoute({
  getParentRoute: () => app,
  path: "/journal/collections/$name",
  beforeLoad: ({ params }) => {
    if (!isCollection(params.name)) throw redirect({ to: "/journal/collections" });
  },
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(feelingsQuery),
      queryClient.ensureQueryData(appetiteQuery),
      queryClient.ensureQueryData(photosQuery),
      queryClient.ensureQueryData(firstsQuery),
    ]),
  component: lazyRouteComponent(() => import("../features/journal/pages/CollectionPage"), "CollectionPage"),
});
