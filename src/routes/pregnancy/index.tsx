import { createRoute } from "@tanstack/react-router";
import { PhaseGuard } from "../../features/app/PhaseGuard";
import { app } from "../app";

/** The pregnancy: its pages under `/pregnancy`, while the dates say it's the household's phase. */
export const pregnancy = createRoute({ getParentRoute: () => app, path: "/pregnancy", component: () => <PhaseGuard phase="pregnancy" /> });
