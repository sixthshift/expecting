import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { jobsQuery } from "../api/rpc/jobs";
import { putAway } from "../app/features/quiet/putAway";
import { worlds } from "../app/features/quiet/worlds";
import { JobsLead } from "../pillars/drawer/features/jobs/components/lead/JobsLead";
import { app } from "./app";

/** Who does what, a page of its own from the Drawer, as this phone's person sees it. */
export const drawerJobs = createRoute({
  getParentRoute: () => app,
  path: "/drawer/jobs",
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(jobsQuery),
  component: worlds(
    lazyRouteComponent(() => import("../pillars/drawer/features/jobs/pages/JobsPage"), "JobsPage"),
    putAway({ subject: "Who does what", back: { to: "/drawer", label: "The Drawer" }, title: "Who does what", lead: <JobsLead />, width: "3xl" })
  ),
});
