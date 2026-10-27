import { createRoute, lazyRouteComponent, notFound } from "@tanstack/react-router";
import { loadHouseholdState } from "../../components/state";
import { parseSlotKey } from "../../lib/timeline";
import { Route as rootRoute } from "../root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/week/$slot",
  loader: async ({ params }) => {
    const slot = parseSlotKey(params.slot);
    if (!slot) throw notFound();
    return { slot, state: await loadHouseholdState() };
  },
  component: lazyRouteComponent(() => import("./page"), "WeekPage"),
});
