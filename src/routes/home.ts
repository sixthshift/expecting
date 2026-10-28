import { createRoute } from "@tanstack/react-router";
import { phasePage } from "../features/app/phasePage";
import { PHASES } from "../features/phases";
import { app } from "./app";
import { homeSearch } from "./search";

/** The first pillar: the timeline in the pregnancy, each phase's home otherwise. The household's phase picks the page. */
export const home = createRoute({ getParentRoute: () => app, path: "/", validateSearch: homeSearch, component: phasePage(PHASES, "/") });
