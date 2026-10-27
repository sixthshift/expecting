import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { z } from "zod";
import { Route as rootRoute } from "../root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  validateSearch: z.object({ error: z.enum(["wrong", "locked"]).optional(), next: z.string().optional() }),
  component: lazyRouteComponent(() => import("./page"), "LoginPage"),
});
