import { createRoute } from "@tanstack/react-router";
import { phasePage } from "../features/app/phasePage";
import { PHASES } from "../features/phases";
import { app } from "./app";

/** The Toolkit, in the phases that have one. */
export const toolkit = createRoute({ getParentRoute: () => app, path: "/toolkit", component: phasePage(PHASES, "/toolkit") });
