import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { onboardingSearch } from "../search";
import { onboarding } from ".";

/** `/onboarding`: on to the step to ask, the first, or after an answer (`?after=due`) the next. */
export const onboardingNext = createRoute({
  getParentRoute: () => onboarding,
  path: "/",
  validateSearch: onboardingSearch,
  component: lazyRouteComponent(() => import("../../features/onboarding/Onboarding"), "OnboardingNext"),
});
