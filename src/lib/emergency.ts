// Emergency info: the one page to open when something goes wrong, or labour starts,
// and to hand to whoever is treating her. The fields are fixed here, in the
// order the form asks them; their values are shared by both of you, and blank
// until one of you fills one in. Ids are stored: never rename one.

export type EmergencyKind = "phone" | "line" | "lines" | "date" | "tick";

export type EmergencyField = {
  id: string;
  label: string;
  kind: EmergencyKind;
  /** What goes in it, shown while it's empty. */
  hint?: string;
};

export type EmergencyGroup = { id: string; title: string; fields: readonly EmergencyField[] };

/** A tick's value when it's ticked; unticked, it has none. */
export const TICKED = "yes";

export const EMERGENCY: readonly EmergencyGroup[] = [
  {
    id: "who",
    title: "Who it's for",
    fields: [
      { id: "fullName", label: "Full name", kind: "line", hint: "As on her Medicare card and the hospital's letters" },
      { id: "dateOfBirth", label: "Date of birth", kind: "date" },
    ],
  },
  {
    id: "health",
    title: "What a doctor will ask",
    fields: [
      { id: "allergies", label: "Allergies", kind: "lines", hint: "Medicines, latex, foods, and what happens" },
      { id: "noKnownAllergies", label: "No known allergies", kind: "tick" },
      { id: "bloodGroup", label: "Blood group", kind: "line", hint: "For example, O negative" },
      {
        id: "pregnancy",
        label: "This pregnancy",
        kind: "lines",
        hint: "Anything found so far: diabetes, blood pressure, a low-lying placenta, the GBS swab; or nothing",
      },
      { id: "pastPregnancies", label: "Past pregnancies", kind: "lines", hint: "Births, losses and terminations, and how each baby was born" },
      { id: "medications", label: "Medicines taken", kind: "lines", hint: "Including vitamins and supplements; or none" },
      { id: "conditions", label: "Health history", kind: "lines", hint: "Conditions and past surgery; or none" },
    ],
  },
  {
    id: "booked",
    title: "Where she's booked",
    fields: [
      { id: "hospital", label: "Hospital", kind: "lines", hint: "Its name, and the address for the car" },
      { id: "birthSuitePhone", label: "Birth suite", kind: "phone", hint: "The number to ring when labour starts, or something feels wrong" },
      { id: "hospitalRecord", label: "Hospital record number", kind: "line", hint: "The URN or MRN on the hospital's letters" },
      { id: "carer", label: "Midwife or obstetrician", kind: "line" },
      { id: "carerPhone", label: "Their number", kind: "phone" },
    ],
  },
  {
    id: "call",
    title: "Who else to call",
    fields: [
      { id: "gp", label: "GP", kind: "line" },
      { id: "gpPhone", label: "GP's number", kind: "phone" },
      { id: "support", label: "Someone else to call", kind: "lines", hint: "A parent or friend: their name and number" },
    ],
  },
  {
    id: "desk",
    title: "For the front desk",
    fields: [
      { id: "medicare", label: "Medicare", kind: "line", hint: "Card number and the number beside the name" },
      { id: "healthFund", label: "Private health fund", kind: "line", hint: "The fund, and the membership number" },
    ],
  },
];

export const EMERGENCY_FIELDS: readonly EmergencyField[] = EMERGENCY.flatMap((g) => g.fields);

export const EMERGENCY_IDS = EMERGENCY_FIELDS.map((f) => f.id) as [string, ...string[]];

/** The longest value a field keeps. */
export const EMERGENCY_MAX = 500;

/** The values, by field, with who last changed them and when. */
export type EmergencyInfo = {
  values: Record<string, string>;
  changed: { by: string | null; at: string } | null;
};

/** Numbers that are the same for everyone, always on the page. From the numbers-to-save item, checked against its sources. */
export const ALWAYS: readonly { label: string; phone: string; about: string }[] = [
  { label: "Emergency", phone: "000", about: "Ambulance, police, fire" },
  { label: "healthdirect", phone: "1800 022 222", about: "A registered nurse, 24 hours a day" },
  { label: "Pregnancy, Birth and Baby", phone: "1800 882 436", about: "Maternal child health nurses, 7 am to midnight (AET)" },
];

/** A phone number as a `tel:` link: digits and a leading plus only. */
export function telHref(phone: string): string {
  return `tel:${phone.trim().replace(/(?!^\+)[^\d]/g, "")}`;
}

/** A value as typed, tidied: trailing spaces gone on each line, and no blank lines at either end. */
export function tidyValue(typed: string): string {
  return typed
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}
