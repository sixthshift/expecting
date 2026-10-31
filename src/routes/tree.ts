// The route tree: its shape, and nothing else. Each route is defined in its own
// file beside this one (a path, what it loads and validates, the component it
// draws); here they are put together. Routing is still code: a file's name
// decides nothing, this list does. Pages live in src/features/ and read their
// route's data through getRouteApi, so nothing imports a route but the router.

import { app } from "./app";
import { login } from "./auth/login";
import { drawer } from "./drawer";
import { drawerNames } from "./drawerNames";
import { emergency } from "./emergency";
import { index } from "./index";
import { journal } from "./journal";
import { journalBook } from "./journalBook";
import { library } from "./library";
import { libraryItem } from "./libraryItem";
import { notFound } from "./notFound";
import { onboarding } from "./onboarding";
import { baby } from "./onboarding/baby";
import { due } from "./onboarding/due";
import { extras } from "./onboarding/extras";
import { onboardingNext } from "./onboarding/next";
import { question } from "./onboarding/question";
import { ready } from "./onboarding/ready";
import { who } from "./onboarding/who";
import { planner } from "./planner";
import { rootRoute } from "./root";
import { settings } from "./settings";
import { timeline } from "./timeline";

// /api/* is served by the server alone: its handlers may import the store, and
// the browser never routes there, it fetches. Vite fixes import.meta.env.SSR
// at build time, so the client bundle drops this branch and the modules
// behind it. The type stays the full list so both sides see one tree.
const api = import.meta.env.SSR ? (await import("../api/rest")).restRoutes : ([] as unknown as typeof import("../api/rest").restRoutes);

export const routeTree = rootRoute.addChildren([
  // The frame: the pillars, in navigation order, then settings, then any other address.
  app.addChildren([index, timeline, library, libraryItem, planner, journal, journalBook, drawer, drawerNames, emergency, settings, notFound]),
  // Outside the frame: the first-run questions, a step to a URL, and logging in.
  onboarding.addChildren([onboardingNext, who, due, baby, question, extras, ready]),
  login,
  ...api,
]);
