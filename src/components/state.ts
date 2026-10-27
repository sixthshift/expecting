// What the app loads: the household (its dates, answers and people), the
// checklist's state and the questions. One load for every pillar, so moving
// between them is instant and they never disagree.

import { getChecklist } from "../server/functions/checklist";
import { getHousehold } from "../server/functions/household";
import { getPeople } from "../server/functions/people";
import { listQuestions } from "../server/functions/questions";

export async function loadHouseholdState() {
  const [household, checklist, people] = await Promise.all([getHousehold(), getChecklist(), getPeople()]);
  return { household, ...checklist, ...people };
}

export type HouseholdState = Awaited<ReturnType<typeof loadHouseholdState>>;

export async function loadApp() {
  const [state, questions] = await Promise.all([loadHouseholdState(), listQuestions()]);
  return { state, questions };
}
