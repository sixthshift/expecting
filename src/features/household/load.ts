// What the app loads: the household (its dates, answers and people), the
// checklist's state and the questions. One load for every pillar, so moving
// between them is instant and they never disagree.

import { getChecklist } from "../../api/rpc/checklist";
import { getAnswers } from "../../api/rpc/facts";
import { getHousehold } from "../../api/rpc/household";
import { getPeople } from "../../api/rpc/people";
import { listQuestions } from "../../api/rpc/questions";
import { factsOf } from "../../lib/facts";
import { onboardingSteps } from "../../lib/onboarding";

export async function loadHouseholdState() {
  const [household, answers, checklist, people] = await Promise.all([getHousehold(), getAnswers(), getChecklist(), getPeople()]);
  return { household, answers, ...checklist, ...people };
}

export type HouseholdState = Awaited<ReturnType<typeof loadHouseholdState>>;

export async function loadApp() {
  const [state, questions] = await Promise.all([loadHouseholdState(), listQuestions()]);
  return { state, questions };
}

/** The first-run questions this phone, or this household, still has to answer. None once it's set up. */
export function onboardingLeft(state: HouseholdState) {
  return onboardingSteps({ known: state.me !== null, onboarded: state.household.onboardedAt !== null, facts: factsOf(state.answers) });
}
