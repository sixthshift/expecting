import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { listQuestions } from "../../server/functions/questions";
import { Route as rootRoute } from "../root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/questions",
  loader: () => listQuestions(),
  component: lazyRouteComponent(() => import("./page"), "QuestionsPage"),
});
