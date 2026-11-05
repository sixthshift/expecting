import { createRoute } from "@tanstack/react-router";
import { app } from "../../../../routes/app";

/** Settings' addresses, under `/settings`: a path only, so nothing wraps its pages; each section is a page of its own. */
export const settings = createRoute({
  getParentRoute: () => app,
  path: "settings",
});
