import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { putAway } from "../app/features/quiet/putAway";
import { worlds } from "../app/features/quiet/worlds";
import { app } from "./app";
import { plannerWeeksSearch } from "./search";

/** The Planner's chart: what's to do across the weeks, opened at a stage (`?stage=32`) or at the top. */
export const plannerWeeks = createRoute({
  getParentRoute: () => app,
  path: "/planner/weeks",
  validateSearch: plannerWeeksSearch,
  component: worlds(
    lazyRouteComponent(() => import("../pillars/planner/features/weeks/pages/WeeksPage"), "WeeksPage"),
    putAway({
      subject: "The to-do list",
      aside: true,
      back: { to: "/planner", label: "Planner" },
      title: "Across the weeks",
      lead: "When each thing opens, when it's best done by, and when it closes.",
    })
  ),
});
