import { createRoute, lazyRouteComponent, redirect } from "@tanstack/react-router";
import { loadHouseholdState } from "../../components/state";
import { onboardingSteps } from "../../lib/onboarding";
import { Route as rootRoute } from "../root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/welcome",
  loader: async () => {
    const state = await loadHouseholdState();
    const steps = onboardingSteps({ known: state.me !== null, onboarded: state.household.onboardedAt !== null, profile: state.household.profile });
    if (steps.length === 0) throw redirect({ to: "/" });
    return state;
  },
  component: lazyRouteComponent(() => import("./page"), "WelcomePage"),
});
