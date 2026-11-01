import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { jobsQuery } from "../api/rpc/jobs";
import { app } from "./app";

/** Who does what, a page of its own from the Drawer, as this phone's person sees it. */
export const drawerJobs = createRoute({
  getParentRoute: () => app,
  path: "/drawer/jobs",
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(jobsQuery),
  component: lazyRouteComponent(() => import("../features/jobs/pages/JobsPage"), "JobsPage"),
});
