// Which phase the household is in now, and so which of Expecting's apps it
// sees (src/features/phases/<phase>/):
//
//   preconception  no due date yet, and not expecting
//   pregnancy      a due date, or expecting without one yet: the timeline
//   postpartum     a birth date, or 42 weeks done with none
//
// Derived on every read from the dates and the "expecting yet?" answer, like
// the current slot. Nothing stores it: entering a due date or a birth date is
// what moves the household on. "Phase" is the code's word; the screens never
// show it.

import type { Profile } from "../content/profile";
import type { ISODate } from "./dates";
import { EXPECTING, NOT_YET } from "./onboarding";
import { type Phase, positionOn } from "./timeline";

export function currentPhase({ dueDate, birthDate, profile }: { dueDate: ISODate | null; birthDate: ISODate | null; profile: Profile }, today: ISODate): Phase {
  if (dueDate) return positionOn(today, dueDate, birthDate).slot.phase === "postpartum" ? "postpartum" : "pregnancy";
  return profile[EXPECTING] === NOT_YET ? "preconception" : "pregnancy";
}
