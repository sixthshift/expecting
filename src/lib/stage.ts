// Which app the household is in. Each stage has its own shell, with its own
// pillars and its own home, over the same data (src/components/stages/):
//
//   preconception  getting ready: no due date yet, and not expecting
//   pregnancy      a due date, or expecting without one yet: the timeline
//   postpartum     a birth date, or past 42 weeks with none
//
// Derived on every read from the dates and the stage answer, like the current
// slot. Nothing stores it: entering a due date or a birth date is what moves
// the household on.

import type { Profile } from "../content/profile";
import type { ISODate } from "./dates";
import { NOT_YET, STAGE } from "./onboarding";
import { positionOn } from "./timeline";

export type Stage = "preconception" | "pregnancy" | "postpartum";

export function stageOf({ dueDate, birthDate, profile }: { dueDate: ISODate | null; birthDate: ISODate | null; profile: Profile }, today: ISODate): Stage {
  if (dueDate) return positionOn(today, dueDate, birthDate).slot.phase === "postpartum" ? "postpartum" : "pregnancy";
  return profile[STAGE] === NOT_YET ? "preconception" : "pregnancy";
}
