import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { worlds } from "../../../app/features/quiet/worlds";
import { planner } from "./planner";

/** `/planner/questions`: the questions for the next appointment, and those asked. While something has happened, the quiet Planner, which keeps them. */
export const questions = createRoute({
  getParentRoute: () => planner,
  path: "questions",
  component: worlds(
    lazyRouteComponent(() => import("../pages/QuestionsPage"), "QuestionsPage"),
    lazyRouteComponent(() => import("../quiet/pages/QuietPlannerPage"), "QuietPlannerPage")
  ),
});
