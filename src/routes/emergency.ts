import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { emergencyQuery } from "../api/rpc/emergency";
import { app } from "./app";

/** Emergency info: the Drawer's page to open when something goes wrong. */
export const emergency = createRoute({
  getParentRoute: () => app,
  path: "/drawer/emergency",
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(emergencyQuery),
  component: lazyRouteComponent(() => import("../features/drawer/pages/EmergencyPage"), "EmergencyPage"),
});
