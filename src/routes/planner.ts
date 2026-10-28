import { createRoute } from "@tanstack/react-router";
import { phasePage } from "../features/app/phasePage";
import { PHASES } from "../features/phases";
import { app } from "./app";

/** The Planner, as the household's phase plans. */
export const planner = createRoute({ getParentRoute: () => app, path: "/planner", component: phasePage(PHASES, "/planner") });
