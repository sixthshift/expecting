import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { app } from "./app";
import { settingsSearch } from "./search";

/** Settings: the household's answers, the colours and this phone; `?ask=cover` opens at a question. */
export const settings = createRoute({
  getParentRoute: () => app,
  path: "/settings",
  validateSearch: settingsSearch,
  component: lazyRouteComponent(() => import("../features/settings/SettingsPage"), "SettingsPage"),
});
