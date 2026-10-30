// Emergency info: the one page to open when something goes wrong, or labour starts.
// Who to call, what a doctor will ask, and the numbers you'll be asked for,
// in the order you'd want them. The fields are fixed here; their values are
// shared by both of you, and blank until one of you fills
// one in.

export type EmergencyKind = "phone" | "line" | "lines";

export type EmergencyField = {
  id: string;
  label: string;
  kind: EmergencyKind;
  /** What goes in it, shown while it's empty. */
  hint?: string;
};

export type EmergencyGroup = { id: string; title: string; fields: readonly EmergencyField[] };

export const EMERGENCY: readonly EmergencyGroup[] = [
  {
    id: "call",
    title: "Who to call",
    fields: [
      { id: "birthSuitePhone", label: "Birth suite", kind: "phone", hint: "The number to ring when labour starts, or something feels wrong" },
      { id: "hospital", label: "Hospital", kind: "lines", hint: "Its name, and the address for the car" },
      { id: "carer", label: "Midwife or obstetrician", kind: "line" },
      { id: "carerPhone", label: "Their number", kind: "phone" },
      { id: "gp", label: "GP", kind: "line" },
      { id: "gpPhone", label: "GP's number", kind: "phone" },
      { id: "support", label: "Someone else to call", kind: "lines", hint: "A parent or friend: their name and number" },
    ],
  },
  {
    id: "health",
    title: "What a doctor will ask",
    fields: [
      { id: "bloodGroup", label: "Blood group", kind: "line", hint: "For example, O negative" },
      { id: "allergies", label: "Allergies", kind: "lines", hint: "Medicines, latex, foods; or none" },
      { id: "medications", label: "Medicines taken", kind: "lines", hint: "Including vitamins and supplements" },
      { id: "conditions", label: "Anything else they should know", kind: "lines", hint: "Conditions, past surgery, this pregnancy's complications" },
    ],
  },
  {
    id: "numbers",
    title: "Numbers you'll be asked for",
    fields: [
      { id: "hospitalRecord", label: "Hospital record number", kind: "line", hint: "The URN or MRN on the hospital's letters" },
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
