// Getting ready: what the night's page needs and doesn't have yet, each a tap
// to where it's filled in. Unlike the Journal this says what's missing: it's
// admin, and directive is what the Planner is for. It adds nothing to the
// Planner; the tasks are already there.

import type { Facts } from "../../settings/model/facts";

/** The bag's task and the car seat's: ticked in the Planner. */
export const BAG_TASK = "pack-hospital-bag";
export const CAR_SEAT_TASK = "buy-and-fit-car-seat";

export type ReadyThing = { key: string; text: string; to: "emergency" | "bag" | "planner" };

/** Whether it's a home birth: the midwife comes to you, and there's no trip. */
export function atHome(facts: Facts): boolean {
  return facts.birthPlace === "home";
}

export function stillToReady({
  values: v,
  facts,
  ticks,
}: {
  values: Readonly<Record<string, string>>;
  facts: Facts;
  ticks: Readonly<Record<string, string>>;
}): ReadyThing[] {
  const home = atHome(facts);
  const things: (ReadyThing | false)[] = [
    home
      ? !v.carerPhone && { key: "carerPhone", text: "Your midwife's number", to: "emergency" }
      : !v.birthSuitePhone && { key: "birthSuitePhone", text: "The birth suite's number", to: "emergency" },
    !v.hospital && { key: "hospital", text: home ? "The hospital, in case you need to go in" : "The hospital's name and address", to: "emergency" },
    !home && !v.hospitalWayIn && { key: "hospitalWayIn", text: "Getting in: where to park, the after-hours entrance", to: "emergency" },
    !v.hospitalSaid && { key: "hospitalSaid", text: "What they said about when to call or come in", to: "emergency" },
    !home && !ticks[BAG_TASK] && { key: "bag", text: "The bag packed", to: "bag" },
    !home && !ticks[CAR_SEAT_TASK] && { key: "carSeat", text: "The car seat fitted", to: "planner" },
    facts.firstBaby === "no" && !v.minder && { key: "minder", text: "Who's minding the kids", to: "emergency" },
    !home && !v.backupDriver && { key: "backupDriver", text: "Someone to drive you in if you can't", to: "emergency" },
  ];
  return things.filter((t): t is ReadyThing => t !== false);
}
