import { useMatch, useNavigate } from "@tanstack/react-router";
import { createContext, type ReactNode, use, useRef } from "react";
import { useAnswersQuery } from "../../../../api/rpc/facts";
import { finishOnboarding, useSettingsQuery } from "../../../../api/rpc/settings";
import { onboardingLeft, type Step } from "../../../../lib/onboarding";
import { Redirect } from "../../../components/Redirect";
import { useAction } from "../../../hooks/useAction";
import { stepAt } from "../model/paths";

/** Save this step's answer (or nothing, to skip), reload what's known, and go on to the next. */
export type Advance = (save?: () => Promise<unknown>) => Promise<void>;

/**
 * A step's context: where it is among the steps, and the ways on. What a
 * step asks, and what's known of it, the step reads itself.
 */
export type OnboardingPage = {
  /** What's left to ask, worked out afresh from what's known. */
  steps: Step[];
  /** The step the URL names. */
  current: Step;
  /** The one before it, for the back button; undefined on the first. */
  previous: Step | undefined;
  advance: Advance;
  /** Onboarding done: on into the app. */
  finish: () => Promise<void>;
  /** A save is in, and its fresh data not yet. */
  saving: boolean;
};

const PageContext = createContext<OnboardingPage | null>(null);

/**
 * The step the URL names, among those left to ask. A step that isn't (or is
 * no longer) asked goes on to the one that is. Each answer is saved as it is
 * given, and what's left is worked out afresh from what is known: once one
 * of you has finished, the other joins straight into the app.
 */
export function OnboardingPageProvider({ children }: { children: ReactNode }) {
  const { data: onboardedAt } = useSettingsQuery({ select: (s) => s.onboardedAt });
  const { data: answers } = useAnswersQuery();
  const navigate = useNavigate();
  // This page's own match, not the location: while a navigation away is pending, the location is already
  // the next one, and this page, still drawn, would take it for a step that isn't there.
  const current = stepAt(useMatch({ strict: false, select: (match) => match.pathname }));
  const steps = onboardingLeft({ onboardedAt, answers });

  /** Save, reload what's known, then on to whatever's next. */
  const [save, saving] = useAction(async (step?: () => Promise<unknown>) => {
    await step?.();
  });

  // A save refetches what's known a query at a time, so midway this step can look answered (this phone
  // known, the rest not yet): keep it as it was until the save is in and has chosen where to go.
  const kept = useRef<OnboardingPage | null>(null);
  if (current && steps.includes(current)) {
    kept.current = {
      steps,
      current,
      previous: steps[steps.indexOf(current) - 1],
      advance: async (step) => {
        if (await save(step)) await navigate({ to: "/onboarding", search: { after: current } });
      },
      finish: async () => {
        if (await save(() => finishOnboarding())) await navigate({ to: "/" });
      },
      saving,
    };
  } else if (!saving || !kept.current) return <Redirect href="/onboarding" />;

  return <PageContext value={kept.current}>{children}</PageContext>;
}

/** Where this step is, and the ways on, inside `OnboardingPageProvider`. */
export function useOnboardingPage(): OnboardingPage {
  const page = use(PageContext);
  if (!page) throw new Error("useOnboardingPage must be called inside OnboardingPageProvider");
  return page;
}
