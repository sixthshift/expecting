import { createRoute, redirect } from "@tanstack/react-router";
import { App } from "../features/app/App";
import { householdQuery, onboardingLeft, questionsQuery } from "../features/household/load";
import { rootRoute } from "./root";

/**
 * The frame around every pillar and settings: the household's data, there
 * before any of them draws. Not a page; it has no path of its own.
 */
export const app = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  loader: async ({ context: { queryClient } }) => {
    const [state] = await Promise.all([queryClient.ensureQueryData(householdQuery), queryClient.ensureQueryData(questionsQuery)]);
    if (onboardingLeft(state).length > 0) throw redirect({ to: "/onboarding" });
  },
  component: App,
});
