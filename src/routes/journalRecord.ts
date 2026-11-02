import { createRoute, lazyRouteComponent, redirect } from "@tanstack/react-router";
import { appetiteQuery } from "../api/rpc/appetite";
import { feelingsQuery } from "../api/rpc/feelings";
import { isRecordKind } from "../lib/records";
import { app } from "./app";

/** One of the Journal's records at full size: `/journal/records/movements`, `appetite`, `feelings` or `papers`; anything else is the records. */
export const journalRecord = createRoute({
  getParentRoute: () => app,
  path: "/journal/records/$kind",
  beforeLoad: ({ params }) => {
    if (!isRecordKind(params.kind)) throw redirect({ to: "/journal/records" });
  },
  loader: ({ context: { queryClient } }) => Promise.all([queryClient.ensureQueryData(feelingsQuery), queryClient.ensureQueryData(appetiteQuery)]),
  component: lazyRouteComponent(() => import("../features/journal/pages/RecordPage"), "RecordPage"),
});
