// The route tree: its shape, and nothing else. Each route is defined in its own
// file beside this one (a path, what it loads and validates, the component it
// draws), a phase's in its folder (src/routes/<phase>/), the pages every phase
// has built per phase by shared.ts; here they are put together. Routing is still code: a file's name
// decides nothing, this list does. Pages live in src/features/ and read their
// route's data through getRouteApi, so nothing imports a route but the router.

import { app } from "./app";
import { login } from "./auth/login";
import { index } from "./index";
import { onboarding } from "./onboarding";
import { baby } from "./onboarding/baby";
import { due } from "./onboarding/due";
import { expecting } from "./onboarding/expecting";
import { onboardingNext } from "./onboarding/next";
import { question } from "./onboarding/question";
import { ready } from "./onboarding/ready";
import { who } from "./onboarding/who";
import { postpartum } from "./postpartum";
import { postpartumHome } from "./postpartum/home";
import { postpartumJournal } from "./postpartum/journal";
import { postpartumToolkit } from "./postpartum/toolkit";
import { preconception } from "./preconception";
import { preconceptionHome } from "./preconception/home";
import { pregnancy } from "./pregnancy";
import { pregnancyHome } from "./pregnancy/home";
import { pregnancyJournal } from "./pregnancy/journal";
import { pregnancyToolkit } from "./pregnancy/toolkit";
import { rootRoute } from "./root";
import { settings } from "./settings";
import { sharedRoutes } from "./shared";

// /api/* is served by the server alone: its handlers may import the store, and
// the browser never routes there, it fetches. Vite fixes import.meta.env.SSR
// at build time, so the client bundle drops this branch and the modules
// behind it. The type stays the full list so both sides see one tree.
const api = import.meta.env.SSR ? (await import("../api/rest")).restRoutes : ([] as unknown as typeof import("../api/rest").restRoutes);

export const routeTree = rootRoute.addChildren([
  // The frame: each phase under its own path, its pages its own and the shared ones, then settings, the same in every phase.
  app.addChildren([
    index,
    preconception.addChildren([preconceptionHome, ...sharedRoutes(preconception)]),
    pregnancy.addChildren([pregnancyHome, pregnancyJournal, pregnancyToolkit, ...sharedRoutes(pregnancy)]),
    postpartum.addChildren([postpartumHome, postpartumJournal, postpartumToolkit, ...sharedRoutes(postpartum)]),
    settings,
  ]),
  // Outside the frame: the first-run questions, a step to a URL, and logging in.
  onboarding.addChildren([onboardingNext, who, expecting, due, baby, question, ready]),
  login,
  ...api,
]);
