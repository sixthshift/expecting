import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { getHousehold } from "../../server/functions/household";
import { getPeople } from "../../server/functions/people";
import { Route as appRoute } from "../app/route";

export const Route = createRoute({
  getParentRoute: () => appRoute,
  path: "/settings",
  loader: async () => {
    const [household, people] = await Promise.all([getHousehold(), getPeople()]);
    return { ...household, ...people };
  },
  component: lazyRouteComponent(() => import("./page"), "SettingsPage"),
});
