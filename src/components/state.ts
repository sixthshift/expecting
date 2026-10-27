// What the timeline loads: the household's dates, the checklist's state and the questions.

import { getChecklist } from "../server/functions/checklist";
import { getHousehold } from "../server/functions/household";
import { listQuestions } from "../server/functions/questions";

export async function loadHouseholdState() {
  const [household, checklist] = await Promise.all([getHousehold(), getChecklist()]);
  return { household, ...checklist };
}

export type HouseholdState = Awaited<ReturnType<typeof loadHouseholdState>>;

export async function loadTimeline() {
  const [state, questions] = await Promise.all([loadHouseholdState(), listQuestions()]);
  return { state, questions };
}
