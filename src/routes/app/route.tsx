import { createRoute, lazyRouteComponent, redirect } from "@tanstack/react-router";
import { loadApp } from "../../components/state";
import { onboardingSteps } from "../../lib/onboarding";
import { Route as rootRoute } from "../root";

/**
 * The app's frame, around every pillar and settings: the navigation, the
 * household's data, and the context content renders against. Not a page; it
 * has no path of its own.
 */
export const Route = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  loader: async () => {
    const data = await loadApp();
    const { household, me } = data.state;
    // A new household, or a phone that hasn't said who's holding it, starts with the first-run questions.
    if (onboardingSteps({ known: me !== null, onboarded: household.onboardedAt !== null, profile: household.profile }).length > 0) {
      throw redirect({ to: "/welcome" });
    }
    return data;
  },
  component: lazyRouteComponent(() => import("../../components/shell/AppShell"), "AppShell"),
});
