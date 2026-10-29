import { useSuspenseQuery } from "@tanstack/react-query";
import { useLocation } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { todayISO } from "../../lib/dates";
import { householdQuery, questionsQuery } from "../household/load";
import { workOut } from "../household/workOut";
import { ContentContext } from "../library/content/context";
import { PillarLayout } from "./PillarLayout";
import { PILLARS } from "./pillars";
import { useExpectingTheme } from "./useExpectingTheme";

/**
 * Around every pillar: the household's colours and the
 * context content renders against, then the pillars in their layout.
 */
export function App() {
  const { data: state } = useSuspenseQuery(householdQuery);
  const { data: questions } = useSuspenseQuery(questionsQuery);
  const today = todayISO();
  const { now, facts } = useMemo(() => workOut(state, today), [state, today]);
  useExpectingTheme(state.household.baby);
  const { pathname } = useLocation();

  // A new pillar starts at its top; the timeline places itself (this week, or ?at=).
  useEffect(() => {
    if (pathname !== "/timeline") window.scrollTo(0, 0);
  }, [pathname]);

  const content = useMemo(() => ({ facts, now, openQuestions: questions.filter((q) => !q.askedAt).map((q) => q.text) }), [facts, now, questions]);

  return (
    <ContentContext.Provider value={content}>
      <PillarLayout pillars={PILLARS} />
    </ContentContext.Provider>
  );
}
