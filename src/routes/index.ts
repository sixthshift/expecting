import { createRoute } from "@tanstack/react-router";
import { GoHome } from "../features/app/PhaseGuard";
import { app } from "./app";

/** `/`: on to the household's phase's home (`/pregnancy`), wherever the dates put it. */
export const index = createRoute({ getParentRoute: () => app, path: "/", component: GoHome });
