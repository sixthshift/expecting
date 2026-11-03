import { createRoute } from "@tanstack/react-router";
import { app } from "../../../routes/app";

/** The Library's addresses, under `/library`: a path only, so nothing wraps its pages; each draws its own frame. */
export const library = createRoute({
  getParentRoute: () => app,
  path: "library",
});
