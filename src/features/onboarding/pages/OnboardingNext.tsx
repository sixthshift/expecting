import { getRouteApi } from "@tanstack/react-router";
import { useAnswersQuery } from "../../../api/rpc/facts";
import { useSettingsQuery } from "../../../api/rpc/settings";
import { Redirect } from "../../../app/components/Redirect";
import { onboardingLeft, type Step, stepAfter } from "../../../lib/onboarding";
import { stepHref } from "../model/paths";

const route = getRouteApi("/onboarding/");

/**
 * `/onboarding`: on to the step to ask. After an answer (`?after=due`), the
 * next one still to ask, from what's known now; else the first.
 */
export function OnboardingNext() {
  const { data: onboardedAt } = useSettingsQuery({ select: (s) => s.onboardedAt });
  const { data: answers } = useAnswersQuery();
  const { after } = route.useSearch();
  const steps = onboardingLeft({ onboardedAt, answers });
  const next = after ? stepAfter(steps, after as Step) : steps[0];
  return <Redirect href={next ? stepHref(next) : "/"} />;
}
