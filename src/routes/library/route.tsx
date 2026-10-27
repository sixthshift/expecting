import { createRoute } from "@tanstack/react-router";
import { z } from "zod";
import { byStage } from "../../components/stages/byStage";
import { PAGES } from "../../components/stages/pages";
import { Route as appRoute } from "../app/route";

export const Route = createRoute({
  getParentRoute: () => appRoute,
  path: "/library",
  validateSearch: z.object({ q: z.string().optional().catch(undefined) }),
  component: byStage(PAGES.library),
});
