import { createRoute } from "@tanstack/react-router";
import { phasePage } from "../features/app/phasePage";
import { PHASES } from "../features/phases";
import { app } from "./app";
import { librarySearch } from "./search";

/** The Library, as the household's phase arranges it. */
export const library = createRoute({ getParentRoute: () => app, path: "/library", validateSearch: librarySearch, component: phasePage(PHASES, "/library") });
