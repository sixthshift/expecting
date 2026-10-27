// What most screens load: the household's dates and the checklist's state.

import { getChecklist } from "../server/functions/checklist";
import { getHousehold } from "../server/functions/household";

export async function loadHouseholdState() {
  const [household, checklist] = await Promise.all([getHousehold(), getChecklist()]);
  return { household, ...checklist };
}

export type HouseholdState = Awaited<ReturnType<typeof loadHouseholdState>>;
