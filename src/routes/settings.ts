import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { connectionsQuery } from "../api/rpc/connections";
import { accessQuery } from "../api/rpc/session";
import { app } from "./app";
import { settingsSearch } from "./search";

/** Settings: your answers, the colours and this phone; `?ask=cover` opens at a question. */
export const settings = createRoute({
  getParentRoute: () => app,
  path: "/settings",
  validateSearch: settingsSearch,
  // Whether there is a way out to offer (with logins off, there is no logging out), and what Claude has connected.
  loader: ({ context: { queryClient } }) => Promise.all([queryClient.ensureQueryData(accessQuery), queryClient.ensureQueryData(connectionsQuery)]),
  component: lazyRouteComponent(() => import("../features/settings/pages/SettingsPage"), "SettingsPage"),
});
