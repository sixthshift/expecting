import { createRoute } from "@tanstack/react-router";
import { NotFound } from "../app/pages/NotFound";
import { app } from "./app";

/** Any other address, in the frame: the pillars stay, and it looks for what was meant. */
export const notFound = createRoute({
  getParentRoute: () => app,
  path: "$",
  component: NotFound,
});
