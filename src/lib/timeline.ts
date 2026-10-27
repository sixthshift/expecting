// The spine of the app: where on the timeline a moment sits.
//
// A slot is one place on the timeline. There are three phases:
//   before      — things to do before or very early in a pregnancy (private health, folate)
//   pregnancy   — weeks 1 to 42, counted as completed weeks of gestation, the way
//                 midwives and the national guidelines count ("28 weeks" is 28+0 to 28+6)
//   postpartum  — weeks 1 to 12 after the birth, counted from the birth date
//
// The current slot is derived from the due date (and the birth date once it is
// entered) on every read. Nothing here stores it.

import { addDays, daysBetween, type ISODate } from "./dates";

export type Phase = "before" | "pregnancy" | "postpartum";

export type Slot = { phase: "before" } | { phase: "pregnancy"; week: number } | { phase: "postpartum"; week: number };

export const PREGNANCY_WEEKS = { first: 1, last: 42 } as const;
export const POSTPARTUM_WEEKS = { first: 1, last: 12 } as const;

/** Days from the first day of the last period to the due date: 40+0. */
export const TERM_DAYS = 280;

const PHASE_ORDER: Record<Phase, number> = { before: 0, pregnancy: 1, postpartum: 2 };

/** Every slot, in timeline order. */
export function allSlots(): Slot[] {
  const slots: Slot[] = [{ phase: "before" }];
  for (let week = PREGNANCY_WEEKS.first; week <= PREGNANCY_WEEKS.last; week++) slots.push({ phase: "pregnancy", week });
  for (let week = POSTPARTUM_WEEKS.first; week <= POSTPARTUM_WEEKS.last; week++) slots.push({ phase: "postpartum", week });
  return slots;
}

/** Negative when `a` comes before `b`, zero when they are the same slot. */
export function compareSlots(a: Slot, b: Slot): number {
  const byPhase = PHASE_ORDER[a.phase] - PHASE_ORDER[b.phase];
  if (byPhase !== 0) return byPhase;
  return weekOf(a) - weekOf(b);
}

export function sameSlot(a: Slot, b: Slot): boolean {
  return compareSlots(a, b) === 0;
}

function weekOf(slot: Slot): number {
  return slot.phase === "before" ? 0 : slot.week;
}

/** The slot's URL key: `before`, `28`, `pp3`. */
export function slotKey(slot: Slot): string {
  switch (slot.phase) {
    case "before":
      return "before";
    case "pregnancy":
      return String(slot.week);
    case "postpartum":
      return `pp${slot.week}`;
  }
}

/** The slot a URL key names, or null when it names none. */
export function parseSlotKey(key: string): Slot | null {
  if (key === "before") return { phase: "before" };
  const pp = /^pp(\d{1,2})$/.exec(key);
  if (pp) {
    const week = Number(pp[1]);
    return week >= POSTPARTUM_WEEKS.first && week <= POSTPARTUM_WEEKS.last ? { phase: "postpartum", week } : null;
  }
  if (/^\d{1,2}$/.test(key)) {
    const week = Number(key);
    return week >= PREGNANCY_WEEKS.first && week <= PREGNANCY_WEEKS.last ? { phase: "pregnancy", week } : null;
  }
  return null;
}

/** The slot one step either side, or null at either end of the timeline. */
export function neighbour(slot: Slot, step: -1 | 1): Slot | null {
  const slots = allSlots();
  const at = slots.findIndex((s) => sameSlot(s, slot));
  return slots[at + step] ?? null;
}

/** "Before", "Week 28", "Week 3 after birth". */
export function slotLabel(slot: Slot): string {
  switch (slot.phase) {
    case "before":
      return "Before you start";
    case "pregnancy":
      return `Week ${slot.week}`;
    case "postpartum":
      return `Week ${slot.week} after birth`;
  }
}

/** A short form for tight places: "Before", "28", "+3". */
export function slotShortLabel(slot: Slot): string {
  switch (slot.phase) {
    case "before":
      return "Before";
    case "pregnancy":
      return String(slot.week);
    case "postpartum":
      return `+${slot.week}`;
  }
}

export type Position = {
  slot: Slot;
  /** Days since the first day of the last period, while pregnant. */
  gestationDays?: number;
  /** Days since the birth, once born. */
  daysSinceBirth?: number;
  /** Whether postpartum was reached from an entered birth date, or assumed from the due date. */
  birthAssumed?: boolean;
};

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/**
 * Where `today` sits, given the due date and the birth date if there is one.
 *
 * A birth date moves the household into postpartum from that day. Without
 * one, pregnancy runs to the end of week 42; past that the due date stands in
 * for the birth, so the app never sticks at 42 because nobody updated it.
 * More than 40 weeks before the due date, the household is still "before".
 */
export function positionOn(today: ISODate, dueDate: ISODate, birthDate?: ISODate | null): Position {
  if (birthDate && daysBetween(birthDate, today) >= 0) return postpartumFrom(today, birthDate, false);

  const gestationDays = TERM_DAYS - daysBetween(today, dueDate);
  if (gestationDays < 0) return { slot: { phase: "before" } };
  if (gestationDays >= (PREGNANCY_WEEKS.last + 1) * 7 && !birthDate) return postpartumFrom(today, dueDate, true);

  const week = clamp(Math.floor(gestationDays / 7), PREGNANCY_WEEKS.first, PREGNANCY_WEEKS.last);
  return { slot: { phase: "pregnancy", week }, gestationDays };
}

function postpartumFrom(today: ISODate, birthDate: ISODate, birthAssumed: boolean): Position {
  const daysSinceBirth = daysBetween(birthDate, today);
  const week = clamp(Math.floor(daysSinceBirth / 7) + 1, POSTPARTUM_WEEKS.first, POSTPARTUM_WEEKS.last);
  return { slot: { phase: "postpartum", week }, daysSinceBirth, birthAssumed };
}

/** Gestation as midwives write it: "28+3". */
export function gestationLabel(gestationDays: number): string {
  return `${Math.floor(gestationDays / 7)}+${gestationDays % 7}`;
}

/** The first day of a pregnancy week, given the due date. */
export function pregnancyWeekStarts(week: number, dueDate: ISODate): ISODate {
  return addDays(dueDate, week * 7 - TERM_DAYS);
}
