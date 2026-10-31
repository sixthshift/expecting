// The handover: Emergency info as the person treating her wants it, in the
// order a paramedic or an emergency doctor asks (who, how far along, allergies,
// blood, the pregnancy, medicines, history, where her notes are), from the
// fields and the answers.

import { formatDate, type ISODate, isISODate } from "../../../lib/dates";
import { TICKED } from "../../../lib/emergency";
import { gestationLabel, positionOn } from "../../../lib/timeline";

type HandoverRow = {
  id: string;
  label: string;
  value: string;
  /** A number to call from the row. */
  phone?: string;
  /** Said loudest: an allergy. */
  alert?: boolean;
};

export type Handover = {
  name: string | null;
  born: { date: ISODate; age: number } | null;
  /** How far along, the due date and how many babies; after a loss, when it ended. */
  pregnancy: string | null;
  rows: HandoverRow[];
  /** What a doctor would ask that's still blank, by label. */
  missing: string[];
};

export type HandoverInput = {
  values: Readonly<Record<string, string>>;
  facts: Readonly<Record<string, string | undefined>>;
  /** The carrying parent's name in the app, until the full name is filled in. */
  carrying: string | null;
  dueDate: ISODate | null;
  today: ISODate;
  /** The day a loss was said, if there's been one. */
  lostOn: ISODate | null;
};

const BABIES: Record<string, string> = { twins: "twins", more: "more than two babies" };

const lines = (...parts: (string | null | undefined | false)[]) => parts.filter(Boolean).join("\n");

/** Whole years from `born` to `on`. */
export function ageOn(born: ISODate, on: ISODate): number {
  const [by, bm, bd] = born.split("-").map(Number) as [number, number, number];
  const [oy, om, od] = on.split("-").map(Number) as [number, number, number];
  return oy - by - (om < bm || (om === bm && od < bd) ? 1 : 0);
}

export function handover({ values: v, facts, carrying, dueDate, today, lostOn }: HandoverInput): Handover {
  const dob = v.dateOfBirth;
  const born = dob && isISODate(dob) ? { date: dob, age: ageOn(dob, today) } : null;

  const babies = facts.babies ? BABIES[facts.babies] : undefined;
  let pregnancy: string | null = null;
  if (lostOn) {
    const at = dueDate ? positionOn(lostOn, dueDate) : null;
    pregnancy = `Pregnancy loss${at ? ` at ${gestationLabel(at.gestationDays)} weeks` : ""}, on or before ${formatDate(lostOn)}`;
  } else if (dueDate) {
    const at = positionOn(today, dueDate);
    pregnancy = [
      `${gestationLabel(at.gestationDays)} weeks pregnant`,
      `due ${formatDate(dueDate, { day: "numeric", month: "short", year: "numeric" })}`,
      babies,
    ]
      .filter(Boolean)
      .join(" · ");
  }

  const allergies = v.allergies ?? (v.noKnownAllergies === TICKED ? "No known allergies" : undefined);
  const rhd = facts.rhd === "negative" ? "RhD negative" : facts.rhd === "positive" ? "RhD positive" : undefined;
  const blood = v.bloodGroup ?? rhd;
  const thisPregnancy = lines(facts.birth === "caesarean" && "Planned caesarean", v.pregnancy);
  const before = lines(facts.firstBaby === "yes" && "First baby", facts.previousCaesarean === "yes" && "A caesarean before", v.pastPregnancies);
  const booked = lines(v.hospital, v.hospitalRecord && `Record number ${v.hospitalRecord}`);

  const rows: HandoverRow[] = [];
  const row = (id: string, label: string, value: string | undefined, extra?: Partial<HandoverRow>) => {
    if (value) rows.push({ id, label, value, ...extra });
  };
  row("allergies", "Allergies", allergies, { alert: Boolean(v.allergies) });
  row("blood", "Blood group", blood);
  row("pregnancy", "This pregnancy", thisPregnancy);
  row("before", "Before", before);
  row("medications", "Medicines", v.medications);
  row("conditions", "History", v.conditions);
  row("booked", "Booked at", booked);
  row("carer", "Midwife or OB", v.carer ?? v.carerPhone, v.carer && v.carerPhone ? { phone: v.carerPhone } : {});

  const missing = [
    !v.fullName && "Full name",
    !born && "Date of birth",
    !allergies && "Allergies",
    !blood && "Blood group",
    !v.pregnancy && "This pregnancy",
    !v.pastPregnancies && facts.firstBaby !== "yes" && "Past pregnancies",
    !v.medications && "Medicines",
    !v.conditions && "Health history",
    !v.hospital && "Hospital",
    !v.birthSuitePhone && "Birth suite",
    !v.hospitalRecord && "Hospital record number",
  ].filter((m): m is string => Boolean(m));

  return { name: v.fullName ?? carrying, born, pregnancy, rows, missing };
}
