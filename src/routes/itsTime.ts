import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { emergencyQuery } from "../api/rpc/emergency";
import { itsTimeQuery } from "../api/rpc/itsTime";
import { app } from "./app";

/** It's time: the page for the night it starts, beside Emergency info (docs/plan-its-time.md). */
export const itsTime = createRoute({
  getParentRoute: () => app,
  path: "/its-time",
  loader: ({ context: { queryClient } }) => Promise.all([queryClient.ensureQueryData(itsTimeQuery), queryClient.ensureQueryData(emergencyQuery)]),
  component: lazyRouteComponent(() => import("../features/itsTime/pages/ItsTimePage"), "ItsTimePage"),
});
