import { createRoute, redirect } from "@tanstack/react-router";
import { App } from "../features/app/App";
import { loadApp, onboardingLeft } from "../features/household/load";
import { rootRoute } from "./root";

/**
 * The frame around every pillar and settings: the household's data, loaded
 * once. Not a page; it has no path of its own.
 */
export const app = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  loader: async () => {
    const data = await loadApp();
    if (onboardingLeft(data.state).length > 0) throw redirect({ to: "/onboarding" });
    return data;
  },
  component: App,
});
