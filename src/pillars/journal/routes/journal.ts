import { createRoute } from "@tanstack/react-router";
import { app } from "../../../routes/app";

/** The Journal's addresses, under `/journal`: a path only, so nothing wraps its pages; each draws its own frame. */
export const journal = createRoute({
  getParentRoute: () => app,
  path: "journal",
});
