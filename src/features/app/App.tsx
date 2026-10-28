import { useLocation } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useApp } from "../household/useApp";
import { ContentContext } from "../library/content/context";
import type { Phases } from "./phaseApp";
import { useExpectingTheme } from "./useExpectingTheme";
import { PhaseAppContext } from "./usePhaseApp";

/**
 * Around every pillar: the household's colours and the context content
 * renders against, whichever phase it's in. Then that phase's app, from
 * `phases`, drawn in its own layout.
 */
export function App({ phases }: { phases: Phases }) {
  const { state, questions, phase, now, nowKey } = useApp();
  useExpectingTheme(state.household.baby);
  const { pathname } = useLocation();
  // Each phase is its own app: its own pillars and its own home, in the layout they share.
  const app = phases[phase];

  // A new pillar starts at its top; the timeline places itself (this week, or ?at=).
  useEffect(() => {
    if (pathname !== app.pillars[0]?.to || !app.timeline) window.scrollTo(0, 0);
  }, [pathname, app]);

  const profile = state.household.profile;
  // biome-ignore lint/correctness/useExhaustiveDependencies: `now` is a new object each render; its key says when it moved.
  const content = useMemo(() => ({ profile, now, openQuestions: questions.filter((q) => !q.askedAt).map((q) => q.text) }), [profile, nowKey, questions]);

  return (
    <PhaseAppContext.Provider value={app}>
      <ContentContext.Provider value={content}>
        <app.Layout pillars={app.pillars} />
      </ContentContext.Provider>
    </PhaseAppContext.Provider>
  );
}
