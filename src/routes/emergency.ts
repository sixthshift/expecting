import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { emergencyQuery } from "../api/rpc/emergency";
import { app } from "./app";

/** Emergency info: its own page, beside settings, to open when something goes wrong. */
export const emergency = createRoute({
  getParentRoute: () => app,
  path: "/emergency",
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(emergencyQuery),
  component: lazyRouteComponent(() => import("../features/emergency/pages/EmergencyPage"), "EmergencyPage"),
});
