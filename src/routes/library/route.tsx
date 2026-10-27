import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { z } from "zod";
import { Route as appRoute } from "../app/route";

export const Route = createRoute({
  getParentRoute: () => appRoute,
  path: "/library",
  validateSearch: z.object({ q: z.string().optional().catch(undefined) }),
  component: lazyRouteComponent(() => import("./page"), "LibraryPage"),
});
