import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { emergencyQuery } from "../../../../api/rpc/emergency";
import { itsTimeQuery } from "../../../../api/rpc/itsTime";
import { app } from "../../../../routes/app";
import { worlds } from "../../quiet/worlds";

/** It's time: the page for the night it starts, beside Emergency info (docs/product/its-time.md). */
export const itsTime = createRoute({
  getParentRoute: () => app,
  path: "its-time",
  loader: ({ context: { queryClient } }) => Promise.all([queryClient.ensureQueryData(itsTimeQuery), queryClient.ensureQueryData(emergencyQuery)]),
  component: worlds(
    lazyRouteComponent(() => import("../pages/ItsTimePage"), "ItsTimePage"),
    lazyRouteComponent(() => import("../quiet/pages/QuietItsTimePage"), "QuietItsTimePage")
  ),
});
