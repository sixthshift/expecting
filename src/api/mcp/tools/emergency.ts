// Emergency info's tool: what a hospital or an ambulance will ask, kept
// ready, for filling in a form or the night it starts.

import { EmergencyRepo } from "../../../db/models/emergency/repo";
import { EMERGENCY_FIELDS } from "../../../lib/emergency";
import { answer, type Tools } from "../answer";

export function emergencyTools({ ctx, read }: Tools) {
  read(
    "emergency_info",
    {
      title: "Emergency info",
      description:
        "What a hospital or an ambulance will ask, kept ready: her details, this pregnancy, allergies, medicines, the hospital and its numbers, who to call. For filling in a hospital's booking-in form or a claim.",
    },
    () => {
      const { values } = new EmergencyRepo(ctx().db).get();
      return answer(Object.fromEntries(EMERGENCY_FIELDS.filter((f) => values[f.id]).map((f) => [f.label, values[f.id]])));
    }
  );
}
