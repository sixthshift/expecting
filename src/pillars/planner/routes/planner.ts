import { createRoute } from "@tanstack/react-router";
import { app } from "../../../routes/app";

/** The Planner's addresses, under `/planner`: a path only, so nothing wraps its pages; each draws its own frame. */
export const planner = createRoute({
  getParentRoute: () => app,
  path: "planner",
});
