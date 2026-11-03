import { createRoute } from "@tanstack/react-router";
import { app } from "../../../routes/app";

/** The Drawer's addresses, under `/drawer`: a path only, so nothing wraps its pages; each draws its own frame. */
export const drawer = createRoute({
  getParentRoute: () => app,
  path: "drawer",
});
