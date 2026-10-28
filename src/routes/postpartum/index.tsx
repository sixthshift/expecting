import { createRoute } from "@tanstack/react-router";
import { PhaseGuard } from "../../features/app/PhaseGuard";
import { app } from "../app";

/** The baby's here: its pages under `/postpartum`, while the dates say it's the household's phase. */
export const postpartum = createRoute({ getParentRoute: () => app, path: "/postpartum", component: () => <PhaseGuard phase="postpartum" /> });
