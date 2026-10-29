import { useLocation } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useAnswers } from "../../../api/rpc/facts";
import { useQuestions } from "../../../api/rpc/questions";
import { useNow, useSettings } from "../../../api/rpc/settings";
import { factsOf } from "../../../lib/facts";
import { ContentContext } from "../../library/components/content/context";
import { PillarLayout } from "../components/layout/PillarLayout";
import { PILLARS } from "../components/layout/pillars";
import { useExpectingTheme } from "../hooks/useExpectingTheme";

/**
 * Around every pillar: the household's colours and the
 * context content renders against, then the pillars in their layout.
 */
export function App() {
  const { data: settings } = useSettings();
  const now = useNow();
  const { data: facts } = useAnswers({ select: factsOf });
  const { data: questions } = useQuestions();
  useExpectingTheme(settings.baby);
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
