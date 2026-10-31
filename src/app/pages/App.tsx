import { useLocation } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useAnswers } from "../../api/rpc/facts";
import { useQuestions } from "../../api/rpc/questions";
import { useQuiet } from "../../api/rpc/quiet";
import { useNow, useSettings } from "../../api/rpc/settings";
import { ContentContext } from "../../features/library/components/content/context";
import { factsOf } from "../../lib/facts";
import { PillarLayout } from "../components/layout/PillarLayout";
import { PILLARS } from "../components/layout/pillars";
import { WhatsNew } from "../components/WhatsNew";
import { useAppTheme } from "../hooks/useAppTheme";

/**
 * Around every pillar: the baby's colours and the
 * context content renders against, then the pillars in their layout, and
 * what's new once after an update. While something has happened, content has
 * no today to draw against, and what's new waits.
 */
export function App() {
  const { data: settings } = useSettings();
  const now = useNow();
  const { data: facts } = useAnswers({ select: factsOf });
  const { data: questions } = useQuestions();
  const { data: quiet } = useQuiet();
  useAppTheme(settings.baby);
  const { pathname } = useLocation();

  // A new pillar starts at its top; the timeline places itself (this week, or ?at=).
  useEffect(() => {
    if (pathname !== "/timeline") window.scrollTo(0, 0);
  }, [pathname]);

  const content = useMemo(
    () => ({ facts, now: quiet ? null : now, openQuestions: questions.filter((q) => !q.askedAt).map((q) => q.text) }),
    [facts, now, quiet, questions]
  );

  return (
    <ContentContext.Provider value={content}>
      <PillarLayout pillars={PILLARS} />
      {quiet ? null : <WhatsNew />}
    </ContentContext.Provider>
  );
}
