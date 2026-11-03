import { createRoute } from "@tanstack/react-router";
import { appetiteQuery } from "../../../api/rpc/appetite";
import { feelingsQuery } from "../../../api/rpc/feelings";
import { firstsQuery } from "../../../api/rpc/firsts";
import { photosQuery } from "../../../api/rpc/photos";
import { journal } from "./journal";

/** The collections' addresses, under `/journal/collections`: a path, and what every collection's page reads. */
export const collections = createRoute({
  getParentRoute: () => journal,
  path: "collections",
  // What the collections read beyond the frame's (the journal and the papers are the frame's).
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(feelingsQuery),
      queryClient.ensureQueryData(appetiteQuery),
      queryClient.ensureQueryData(photosQuery),
      queryClient.ensureQueryData(firstsQuery),
    ]),
});
