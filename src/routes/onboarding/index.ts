import { createRoute, lazyRouteComponent, redirect } from "@tanstack/react-router";
import { householdQuery, onboardingLeft } from "../../features/household/load";
import { rootRoute } from "../root";

/**
 * The first-run questions, outside the frame, a step to a URL
 * (`/onboarding/due`). Done with them, it goes home.
 */
export const onboarding = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  loader: async ({ context: { queryClient } }) => {
    const state = await queryClient.ensureQueryData(householdQuery);
    if (onboardingLeft(state).length === 0) throw redirect({ to: "/" });
  },
  component: lazyRouteComponent(() => import("../../features/onboarding/Onboarding"), "OnboardingLayout"),
});
