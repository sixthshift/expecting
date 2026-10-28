import { createRoute, lazyRouteComponent, redirect } from "@tanstack/react-router";
import { loadHouseholdState, onboardingLeft } from "../features/household/load";
import { rootRoute } from "./root";

/** The first-run questions, outside the frame. Done with them, it goes home. */
export const welcome = createRoute({
  getParentRoute: () => rootRoute,
  path: "/welcome",
  loader: async () => {
    const state = await loadHouseholdState();
    if (onboardingLeft(state).length === 0) throw redirect({ to: "/" });
    return state;
  },
  component: lazyRouteComponent(() => import("../features/onboarding/WelcomePage"), "WelcomePage"),
});
