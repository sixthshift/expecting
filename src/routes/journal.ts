import { createRoute } from "@tanstack/react-router";
import { phasePage } from "../features/app/phasePage";
import { PHASES } from "../features/phases";
import { app } from "./app";

/** The Journal, in the phases that have one. */
export const journal = createRoute({ getParentRoute: () => app, path: "/journal", component: phasePage(PHASES, "/journal") });
