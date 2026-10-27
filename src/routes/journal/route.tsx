import { createRoute } from "@tanstack/react-router";
import { byStage } from "../../components/stages/byStage";
import { PAGES } from "../../components/stages/pages";
import { Route as appRoute } from "../app/route";

export const Route = createRoute({
  getParentRoute: () => appRoute,
  path: "/journal",
  component: byStage(PAGES.journal),
});
