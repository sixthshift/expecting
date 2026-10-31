import { useLocation, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useAnswers } from "../../api/rpc/facts";
import { useQuestions } from "../../api/rpc/questions";
import { useQuiet } from "../../api/rpc/quiet";
import { useNow, useSettings } from "../../api/rpc/settings";
import { ContentContext } from "../../features/library/components/content/context";
import { useDeadlineBadge } from "../../features/tasks/hooks/useDeadlineBadge";
import { factsOf } from "../../lib/facts";
import { PillarLayout } from "../components/layout/PillarLayout";
import { PILLARS } from "../components/layout/pillars";
import { WhatsNew } from "../components/WhatsNew";
import { useAppTheme } from "../hooks/useAppTheme";

/**
 * Around every pillar: the baby's colours and the
 * context content renders against, then the pillars in their layout, and
 * what's new once after an update, and the app icon's badge for deadlines
 * coming up. While something has happened, content has no today to draw
 * against, what's new waits, and there's no badge. Once it has drawn, the
 * other pillars are warmed while the phone is idle (their code, and what
 * their loaders ask for), so moving between them doesn't wait; and Emergency
 * info and It's time with them, the pages wanted in a hurry, perhaps with no
 * signal.
 */
/** What's warmed once the app has drawn: every pillar, and the two pages for a night it can't wait. */
const WARMED = [...PILLARS.map((p) => p.to), "/emergency", "/its-time"] as const;

export function App() {
  const { data: settings } = useSettings();
  const now = useNow();
  const { data: facts } = useAnswers({ select: factsOf });
  const { data: questions } = useQuestions();
  const { data: quiet } = useQuiet();
  useAppTheme(settings.baby);
  useDeadlineBadge(Boolean(quiet));
  const { pathname } = useLocation();
  const router = useRouter();

  useEffect(() => {
    const warm = () => {
      for (const to of WARMED) void router.preloadRoute({ to }).catch(() => undefined);
    };
    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(warm, { timeout: 3000 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(warm, 1500);
    return () => clearTimeout(id);
  }, [router]);

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
