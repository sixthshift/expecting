import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { z } from "zod";
import { onboarding } from "./onboarding";

/** Onboarding's search: the step just answered, to go on from. */
const onboardingSearch = z.object({ after: z.string().optional().catch(undefined) });

/** `/onboarding`: on to the step to ask, the first, or after an answer (`?after=due`) the next. */
export const onboardingNext = createRoute({
  getParentRoute: () => onboarding,
  path: "/",
  validateSearch: onboardingSearch,
  component: lazyRouteComponent(() => import("../pages/OnboardingNext"), "OnboardingNext"),
});
