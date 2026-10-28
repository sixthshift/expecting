// The route tree: its shape, and nothing else. Each route is defined in its own
// file beside this one (a path, what it loads and validates, the component it
// draws); here they are put together. Routing is still code: a file's name
// decides nothing, this list does. Pages live in src/features/ and read their
// route's data through getRouteApi, so nothing imports a route but the router.

import { app } from "./app";
import { home } from "./home";
import { journal } from "./journal";
import { library } from "./library";
import { libraryItem } from "./library-item";
import { login } from "./login";
import { planner } from "./planner";
import { rootRoute } from "./root";
import { settings } from "./settings";
import { toolkit } from "./toolkit";
import { welcome } from "./welcome";

// /api/* is served by the server alone: its handlers may import the store, and
// the browser never routes there, it fetches. Vite fixes import.meta.env.SSR
// at build time, so the client bundle drops this branch and the modules
// behind it. The type stays the full list so both sides see one tree.
const api = import.meta.env.SSR ? (await import("../api/rest")).restRoutes : ([] as unknown as typeof import("../api/rest").restRoutes);

export const routeTree = rootRoute.addChildren([
  // The frame: the pillars and settings, each phase's page picked by the household's phase.
  app.addChildren([home, library, libraryItem, planner, journal, toolkit, settings]),
  // Outside the frame.
  welcome,
  login,
  ...api,
]);
