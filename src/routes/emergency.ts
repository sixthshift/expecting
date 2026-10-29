import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { getEmergency } from "../api/rpc/emergency";
import { app } from "./app";

/** Emergency info: the Drawer's page to open when something goes wrong. */
export const emergency = createRoute({
  getParentRoute: () => app,
  path: "/drawer/emergency",
  loader: () => getEmergency(),
  component: lazyRouteComponent(() => import("../features/drawer/EmergencyPage"), "EmergencyPage"),
});
