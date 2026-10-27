import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { z } from "zod";
import { loadTimeline } from "../../components/state";
import { parseSlotKey } from "../../lib/timeline";
import { VIEWS, type View } from "../../lib/timelineView";
import { Route as rootRoute } from "../root";

const search = z.object({
  /** Which view of the timeline; Everything when absent. */
  view: z
    .enum(Object.keys(VIEWS) as [View, ...View[]])
    .optional()
    .catch(undefined),
  /** A week to open at instead of this one: `before`, `28`, `pp3`. */
  at: z
    .string()
    .optional()
    .catch(undefined)
    .transform((key) => (key && parseSlotKey(key) ? key : undefined)),
});

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: search,
  loader: () => loadTimeline(),
  component: lazyRouteComponent(() => import("./page"), "HomePage"),
});
