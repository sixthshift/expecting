import { createRoute } from "@tanstack/react-router";
import { PhaseGuard } from "../../features/app/PhaseGuard";
import { app } from "../app";

/** The getting ready: its pages under `/preconception`, while the dates say it's the household's phase. */
export const preconception = createRoute({ getParentRoute: () => app, path: "/preconception", component: () => <PhaseGuard phase="preconception" /> });
