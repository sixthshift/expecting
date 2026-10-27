import { useLocation } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useExpectingTheme } from "../../theme/useExpectingTheme";
import { useApp } from "../household/useApp";
import { ContentContext } from "../library/content/context";
import type { Stages } from "./stageApp";

/**
 * Around every pillar: the household's colours and the context content
 * renders against, whichever stage it's in. Then that stage's app, from
 * `stages`, drawn in its own shell.
 */
export function AppShell({ stages }: { stages: Stages }) {
  const { state, questions, stage, now, nowKey } = useApp();
  useExpectingTheme(state.household.baby);
  const { pathname } = useLocation();

  // A new pillar starts at its top; the timeline places itself (this week, or ?at=).
  useEffect(() => {
    if (pathname !== "/" || stage !== "pregnancy") window.scrollTo(0, 0);
  }, [pathname, stage]);

  const profile = state.household.profile;
  // biome-ignore lint/correctness/useExhaustiveDependencies: `now` is a new object each render; its key says when it moved.
  const content = useMemo(() => ({ profile, now, openQuestions: questions.filter((q) => !q.askedAt).map((q) => q.text) }), [profile, nowKey, questions]);

  // Each stage is its own app: its own pillars and its own home, in the frame they share.
  const { Shell, pillars } = stages[stage];
  return (
    <ContentContext.Provider value={content}>
      <Shell pillars={pillars} />
    </ContentContext.Provider>
  );
}
