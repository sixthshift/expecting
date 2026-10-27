import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { z } from "zod";
import { parseSlotKey } from "../../lib/timeline";
import { Route as appRoute } from "../app/route";

const search = z.object({
  /** A week to open at instead of this one: `before`, `28`, `pp3`. */
  at: z
    .string()
    .optional()
    .catch(undefined)
    .transform((key) => (key && parseSlotKey(key) ? key : undefined)),
});

export const Route = createRoute({
  getParentRoute: () => appRoute,
  path: "/",
  validateSearch: search,
  component: lazyRouteComponent(() => import("./page"), "HomePage"),
});
