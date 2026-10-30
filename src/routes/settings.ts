import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { accessQuery } from "../api/rpc/session";
import { app } from "./app";
import { settingsSearch } from "./search";

/** Settings: the household's answers, the colours and this phone; `?ask=cover` opens at a question. */
export const settings = createRoute({
  getParentRoute: () => app,
  path: "/settings",
  validateSearch: settingsSearch,
  // Whether there is a way out to offer: with logins off, there is no logging out.
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(accessQuery),
  component: lazyRouteComponent(() => import("../features/settings/pages/SettingsPage"), "SettingsPage"),
});
