import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { onboarding } from ".";

/** A step's route: one page for every step, which draws the one its URL names. */
export function step<const P extends string>(path: P) {
  return createRoute({
    getParentRoute: () => onboarding,
    path,
    component: lazyRouteComponent(() => import("../../features/onboarding/Onboarding"), "OnboardingStep"),
  });
}
