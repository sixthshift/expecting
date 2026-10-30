import { createRoute, redirect } from "@tanstack/react-router";
import { checklistQuery } from "../api/rpc/checklist";
import { extrasQuery } from "../api/rpc/extras";
import { answersQuery } from "../api/rpc/facts";
import { peopleQuery } from "../api/rpc/people";
import { questionsQuery } from "../api/rpc/questions";
import { quietQuery } from "../api/rpc/quiet";
import { settingsQuery } from "../api/rpc/settings";
import { restoreOutbox } from "../app/model/outbox";
import { App } from "../app/pages/App";
import { onboardingLeft } from "../features/onboarding/model/left";
import { rootRoute } from "./root";

/**
 * The frame around every pillar and settings: the queries nearly every page
 * reads, there before any of them draws, fetched side by side, after the saves
 * left waiting when the app last closed are back, so they show over them. Not
 * a page; it has no path of its own.
 */
export const app = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  loader: async ({ context: { queryClient } }) => {
    await restoreOutbox(queryClient);
    await Promise.all([
      queryClient.ensureQueryData(settingsQuery),
      queryClient.ensureQueryData(answersQuery),
      queryClient.ensureQueryData(peopleQuery),
      queryClient.ensureQueryData(extrasQuery),
      queryClient.ensureQueryData(checklistQuery),
      queryClient.ensureQueryData(questionsQuery),
      queryClient.ensureQueryData(quietQuery),
    ]);
    // From the cache, not as fetched: with the saves still waiting applied over it.
    const settings = queryClient.getQueryData(settingsQuery.queryKey)!;
    const answers = queryClient.getQueryData(answersQuery.queryKey)!;
    const people = queryClient.getQueryData(peopleQuery.queryKey)!;
    if (onboardingLeft({ me: people.me, onboardedAt: settings.onboardedAt, answers }).length > 0) throw redirect({ to: "/onboarding" });
  },
  component: App,
});
