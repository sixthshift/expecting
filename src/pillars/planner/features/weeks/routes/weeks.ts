import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { z } from "zod";
import { putAway } from "../../../../../app/features/quiet/putAway";
import { worlds } from "../../../../../app/features/quiet/worlds";
import { stageEnding } from "../../../../../lib/planner/plan";
import { planner } from "../../../routes/planner";

/** The chart's search: a stage to open at, by the week it ends (`32`); anything else opens at the top. */
const weeksSearch = z.object({
  stage: z.coerce
    .number()
    .int()
    .optional()
    .catch(undefined)
    .transform((end) => (end !== undefined && stageEnding(end) ? end : undefined)),
});

/** The Planner's chart: what's to do across the weeks, opened at a stage (`?stage=32`) or at the top. */
export const weeks = createRoute({
  getParentRoute: () => planner,
  path: "weeks",
  validateSearch: weeksSearch,
  component: worlds(
    lazyRouteComponent(() => import("../pages/WeeksPage"), "WeeksPage"),
    putAway({
      subject: "The to-do list",
      aside: true,
      back: { to: "/planner", label: "Planner" },
      title: "Across the weeks",
      lead: "When each thing opens, when it's best done by, and when it closes.",
    })
  ),
});
