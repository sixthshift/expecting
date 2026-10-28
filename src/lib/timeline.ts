// The spine of the app: where on the timeline a moment sits.
//
// A slot is one place on the timeline. There are three phases, and each is
// also one of Expecting's apps (src/features/phases/<phase>/). "Phase" is the code's word:
// the screens name the moments instead (getting ready, expecting, baby's here).
//   preconception — things to do before or very early in a pregnancy (private health, folate)
//   pregnancy     — weeks 1 to 42, counted as completed weeks of gestation, the way
//                   midwives and the national guidelines count ("28 weeks" is 28+0 to 28+6)
//   postpartum    — weeks 1 to 12 after the birth, counted from the birth date
//
// The current slot is derived from the due date (and the birth date once it is
// entered) on every read. Nothing here stores it.

import { addDays, daysBetween, type ISODate } from "./dates";

export type Phase = "preconception" | "pregnancy" | "postpartum";

export type Slot = { phase: "preconception" } | { phase: "pregnancy"; week: number } | { phase: "postpartum"; week: number };

export const PREGNANCY_WEEKS = { first: 1, last: 42 } as const;
export const POSTPARTUM_WEEKS = { first: 1, last: 12 } as const;

/** Days from the first day of the last period to the due date: 40+0. */
export const TERM_DAYS = 280;

const PHASE_ORDER: Record<Phase, number> = { preconception: 0, pregnancy: 1, postpartum: 2 };

/** Every slot, in timeline order. */
export function allSlots(): Slot[] {
  const slots: Slot[] = [{ phase: "preconception" }];
  for (let week = PREGNANCY_WEEKS.first; week <= PREGNANCY_WEEKS.last; week++) slots.push({ phase: "pregnancy", week });
  for (let week = POSTPARTUM_WEEKS.first; week <= POSTPARTUM_WEEKS.last; week++) slots.push({ phase: "postpartum", week });
  return slots;
}

/** Negative when phase `a` comes before phase `b`, zero when they are the same phase. */
export function comparePhases(a: Phase, b: Phase): number {
  return PHASE_ORDER[a] - PHASE_ORDER[b];
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
  return slot.phase === "preconception" ? 0 : slot.week;
}

/** The slot's URL key: `preconception`, `28`, `pp3`. */
export function slotKey(slot: Slot): string {
  switch (slot.phase) {
    case "preconception":
      return "preconception";
    case "pregnancy":
      return String(slot.week);
    case "postpartum":
      return `pp${slot.week}`;
  }
}

/** The slot a URL key names, or null when it names none. */
export function parseSlotKey(key: string): Slot | null {
  // `before` was the key until the phase was named preconception: an old link still opens.
  if (key === "preconception" || key === "before") return { phase: "preconception" };
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
    case "preconception":
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
    case "preconception":
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
 * More than 40 weeks before the due date, the household is still in preconception.
 */
export function positionOn(today: ISODate, dueDate: ISODate, birthDate?: ISODate | null): Position {
  if (birthDate && daysBetween(birthDate, today) >= 0) return postpartumFrom(today, birthDate, false);

  const gestationDays = TERM_DAYS - daysBetween(today, dueDate);
  if (gestationDays < 0) return { slot: { phase: "preconception" } };
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

/** "Born today", "1 day old", "12 days old". */
export function ageLabel(daysSinceBirth: number): string {
  if (daysSinceBirth === 0) return "Born today";
  return `${daysSinceBirth} ${daysSinceBirth === 1 ? "day" : "days"} old`;
}

/**
 * The due dates worth accepting on `today`: from just past one (a birth not
 * yet entered) to a pregnancy that has barely begun.
 */
export function dueDateBounds(today: ISODate): { minDate: ISODate; maxDate: ISODate } {
  return { minDate: addDays(today, -7 * 3), maxDate: addDays(today, 7 * 44) };
}

/** The first day of a pregnancy week, given the due date. */
export function pregnancyWeekStarts(week: number, dueDate: ISODate): ISODate {
  return addDays(dueDate, week * 7 - TERM_DAYS);
}

/**
 * The calendar days a week covers: pregnancy weeks from the due date, weeks
 * after the birth from the birth date (or the due date until one is entered).
 * Null for preconception, or without a due date.
 */
export function slotDates(slot: Slot, dueDate: ISODate | null, birthDate: ISODate | null): { start: ISODate; end: ISODate } | null {
  if (!dueDate || slot.phase === "preconception") return null;
  const start = slot.phase === "pregnancy" ? pregnancyWeekStarts(slot.week, dueDate) : addDays(birthDate ?? dueDate, (slot.week - 1) * 7);
  return { start, end: addDays(start, 6) };
}
