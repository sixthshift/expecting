// Every route, as definitions only: a path, what it loads and validates, and
// the component it draws. Pages live in src/app/ (per phase) and src/features/
// (shared), and read their route's data through getRouteApi, so nothing
// imports from here but the router. This is also where the three apps
// (src/app/) are handed to App.

import { createRoute, lazyRouteComponent, redirect } from "@tanstack/react-router";
import { App } from "../features/app/App";
import { phasePage } from "../features/app/phasePage";
import { loadApp, loadHouseholdState } from "../features/household/load";
import { PHASES } from "../features/phases";
import { onboardingSteps } from "../lib/onboarding";
import { rootRoute } from "./root";
import { homeSearch, librarySearch, loginSearch } from "./search";

/** Whether this phone, or this household, still has first-run questions to answer. */
function onboarding(state: Awaited<ReturnType<typeof loadHouseholdState>>) {
  return onboardingSteps({ known: state.me !== null, onboarded: state.household.onboardedAt !== null, profile: state.household.profile });
}

/**
 * The frame around every pillar and settings: the household's data, loaded
 * once, and the phase's app. Not a page; it has no path of its own.
 */
const app = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  loader: async () => {
    const data = await loadApp();
    if (onboarding(data.state).length > 0) throw redirect({ to: "/welcome" });
    return data;
  },
  component: () => <App phases={PHASES} />,
});

// The pillars: one path each, and the household's phase picks the page.
const home = createRoute({ getParentRoute: () => app, path: "/", validateSearch: homeSearch, component: phasePage(PHASES, "/") });
const library = createRoute({ getParentRoute: () => app, path: "/library", validateSearch: librarySearch, component: phasePage(PHASES, "/library") });
const planner = createRoute({ getParentRoute: () => app, path: "/planner", component: phasePage(PHASES, "/planner") });
const journal = createRoute({ getParentRoute: () => app, path: "/journal", component: phasePage(PHASES, "/journal") });
const toolkit = createRoute({ getParentRoute: () => app, path: "/toolkit", component: phasePage(PHASES, "/toolkit") });

/** One item, to read on its own: from a search, a shelf, or a task's "Why". The same in every phase. */
const libraryItem = createRoute({
  getParentRoute: () => app,
  path: "/library/$itemId",
  component: lazyRouteComponent(() => import("../features/library/LibraryItemPage"), "LibraryItemPage"),
});

const settings = createRoute({
  getParentRoute: () => app,
  path: "/settings",
  component: lazyRouteComponent(() => import("../features/settings/SettingsPage"), "SettingsPage"),
});

/** The first-run questions, outside the frame. Done with them, it goes home. */
const welcome = createRoute({
  getParentRoute: () => rootRoute,
  path: "/welcome",
  loader: async () => {
    const state = await loadHouseholdState();
    if (onboarding(state).length === 0) throw redirect({ to: "/" });
    return state;
  },
  component: lazyRouteComponent(() => import("../features/onboarding/WelcomePage"), "WelcomePage"),
});

const login = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  validateSearch: loginSearch,
  component: lazyRouteComponent(() => import("../features/auth/LoginPage"), "LoginPage"),
});

// /api/* is served by the server alone: its handlers may import the store, and
// the browser never routes there, it fetches. Vite fixes import.meta.env.SSR
// at build time, so the client bundle drops this branch and the modules
// behind it. The type stays the full list so both sides see one tree.
const api = import.meta.env.SSR ? (await import("../api/rest")).restRoutes : ([] as unknown as typeof import("../api/rest").restRoutes);

export const routeTree = rootRoute.addChildren([app.addChildren([home, library, libraryItem, planner, journal, toolkit, settings]), welcome, login, ...api]);
