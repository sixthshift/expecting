import { createRoute, lazyRouteComponent, redirect } from "@tanstack/react-router";
import { extrasQuery } from "../../api/rpc/extras";
import { answersQuery } from "../../api/rpc/facts";
import { peopleQuery } from "../../api/rpc/people";
import { settingsQuery } from "../../api/rpc/settings";
import { onboardingLeft } from "../../features/onboarding/model/left";
import { rootRoute } from "../root";

/**
 * The first-run questions, outside the frame, a step to a URL
 * (`/onboarding/due`). Done with them, it goes home.
 */
export const onboarding = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  loader: async ({ context: { queryClient } }) => {
    const [settings, answers, people] = await Promise.all([
      queryClient.ensureQueryData(settingsQuery),
      queryClient.ensureQueryData(answersQuery),
      queryClient.ensureQueryData(peopleQuery),
      queryClient.ensureQueryData(extrasQuery),
    ]);
    if (onboardingLeft({ me: people.me, onboardedAt: settings.onboardedAt, answers }).length === 0) throw redirect({ to: "/" });
  },
  component: lazyRouteComponent(() => import("../../features/onboarding/pages/Onboarding"), "OnboardingLayout"),
});
