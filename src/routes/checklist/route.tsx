import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { loadHouseholdState } from "../../components/state";
import { Route as rootRoute } from "../root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checklist",
  loader: () => loadHouseholdState(),
  component: lazyRouteComponent(() => import("./page"), "ChecklistPage"),
});
