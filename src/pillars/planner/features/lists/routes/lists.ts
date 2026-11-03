import { createRoute } from "@tanstack/react-router";
import { planner } from "../../../routes/planner";

/** The lists' addresses, under `/planner/lists`: a path only. */
export const lists = createRoute({
  getParentRoute: () => planner,
  path: "lists",
});
