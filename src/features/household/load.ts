// What the app loads, as queries: the household (its dates, answers, extras,
// checklist and people) and the questions, which every pillar reads, and the
// names and Emergency info, which only their pages do. A route's loader makes
// sure its queries are there before the page draws; a save (useAction)
// refreshes whichever are on screen, and the page stays drawn meanwhile.

import { queryOptions } from "@tanstack/react-query";
import { getEmergency } from "../../api/rpc/emergency";
import { getHouseholdState } from "../../api/rpc/household";
import { getNames } from "../../api/rpc/names";
import { listQuestions } from "../../api/rpc/questions";
import { factsOf } from "../../lib/facts";
import { onboardingSteps } from "../../lib/onboarding";

export const householdQuery = queryOptions({ queryKey: ["household"], queryFn: () => getHouseholdState() });
export const questionsQuery = queryOptions({ queryKey: ["questions"], queryFn: () => listQuestions() });
export const namesQuery = queryOptions({ queryKey: ["names"], queryFn: () => getNames() });
export const emergencyQuery = queryOptions({ queryKey: ["emergency"], queryFn: () => getEmergency() });

export type HouseholdState = Awaited<ReturnType<typeof getHouseholdState>>;

/** The first-run questions this phone, or this household, still has to answer. None once it's set up. */
export function onboardingLeft(state: HouseholdState) {
  return onboardingSteps({ known: state.me !== null, onboarded: state.household.onboardedAt !== null, facts: factsOf(state.answers) });
}
