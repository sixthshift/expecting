// The route tree: its shape, and nothing else. Each route is defined in its own
// file (a path, what it loads and validates, the component it draws), in the
// routes/ folder of the pillar or feature it answers for, whose index.ts puts
// its subtree together; here the subtrees are put together. Routing is still
// code: a file's name decides nothing, these lists do. Pages read their route's
// data through getRouteApi, so nothing imports a route but other routes and this.

import { join } from "../app/features/auth/routes/join";
import { login } from "../app/features/auth/routes/login";
import { password } from "../app/features/auth/routes/password";
import { reset } from "../app/features/auth/routes/reset";
import { connect } from "../app/features/connect/routes/connect";
import { emergency } from "../app/features/emergency/routes/emergency";
import { itsTime } from "../app/features/itsTime/routes/itsTime";
import { onboardingRoutes } from "../app/features/onboarding/routes";
import { settingsRoutes } from "../app/features/settings/routes";
import { drawerRoutes } from "../pillars/drawer/routes";
import { homeRoutes } from "../pillars/home/routes";
import { journalRoutes } from "../pillars/journal/routes";
import { libraryRoutes } from "../pillars/library/routes";
import { plannerRoutes } from "../pillars/planner/routes";
import { app } from "./app";
import { notFound } from "./notFound";
import { rootRoute } from "./root";

// /api/* is served by the server alone: its handlers may import the store, and
// the browser never routes there, it fetches. Vite fixes import.meta.env.SSR
// at build time, so the client bundle drops this branch and the modules
// behind it. The type stays the full list so both sides see one tree.
const api = import.meta.env.SSR ? (await import("../api/rest")).restRoutes : ([] as unknown as typeof import("../api/rest").restRoutes);

export const routeTree = rootRoute.addChildren([
  // The app's layout: the pillars, in navigation order, then Emergency info and It's time, settings, then any other address.
  app.addChildren([...homeRoutes, libraryRoutes, plannerRoutes, journalRoutes, drawerRoutes, emergency, itsTime, settingsRoutes, notFound]),
  // Outside the frame: the first-run questions, a step to a URL, logging in, joining, a new password, and letting Claude in.
  onboardingRoutes,
  login,
  join,
  reset,
  password,
  connect,
  ...api,
]);
