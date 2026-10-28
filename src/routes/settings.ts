import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { app } from "./app";

export const settings = createRoute({
  getParentRoute: () => app,
  path: "/settings",
  component: lazyRouteComponent(() => import("../features/settings/SettingsPage"), "SettingsPage"),
});
