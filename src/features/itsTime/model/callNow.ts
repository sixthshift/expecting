// Call now, don't wait: the red flags, in the Library's words, never the
// page's own. Each line names the entry it is from (`from`), and says only
// what that entry's "When to get help" part says. Whether one shows is the
// answers' and the start's to decide, never the page's guess about her body.

import type { Start } from "../../../lib/itsTime";
import type { Facts } from "../../settings/model/facts";

export type Flag = { key: string; text: string; from: string };

/** Ring the birth suite (or the midwife) straight away if… */
const CALL: readonly Flag[] = [
  { key: "colour", text: "the waters are green, brown or blood-coloured", from: "card-waters-colour" },
  { key: "bleeding", text: "she's bleeding from the vagina, different from a mucousy show", from: "when-to-go-to-hospital" },
  { key: "movements", text: "the baby's movements change", from: "when-to-go-to-hospital" },
  { key: "pain", text: "there's pain that doesn't go away between contractions", from: "when-to-go-to-hospital" },
  { key: "unwell", text: "the waters smell bad, she has a temperature of 37.5°C or above, or she feels unwell", from: "waters-breaking" },
];

/** Call 000 and ask for an ambulance if… */
const TRIPLE_ZERO: readonly Flag[] = [
  { key: "not-in-time", text: "you think you may not make it before the baby is born", from: "getting-to-hospital" },
  { key: "severe", text: "there's heavy bleeding, a severe headache or blurred vision", from: "getting-to-hospital" },
];

const BREECH: Flag = {
  key: "breech",
  text: "the waters break and you've been told the baby isn't head-first",
  from: "waters-breaking",
};

const CAESAREAN: Flag = { key: "caesarean", text: "labour starts before the planned caesarean", from: "timing-contractions" };

/** Every flag, for the test that each `from` is an entry that exists. */
export const ALL_FLAGS: readonly Flag[] = [...CALL, ...TRIPLE_ZERO, BREECH, CAESAREAN];

/** Whether the baby may not be head-first: told so, or not sure (or not asked); told head down, it isn't. */
export function mayBeBreech(facts: Facts): boolean {
  return facts.birth !== "caesarean" && facts.presentation !== "head-down";
}

/** Whether the waters have broken with a baby you've been told isn't head-first: then 000 comes first. */
export function breechWaters(facts: Facts, start: Start | null): boolean {
  return facts.birth !== "caesarean" && facts.presentation === "breech" && Boolean(start?.watersAt);
}

/** The flags for you: the call list (with a planned caesarean's), then 000's (with the breech line unless you've been told head down). */
export function flagsFor(facts: Facts): { call: Flag[]; tripleZero: Flag[] } {
  return {
    call: [...(facts.birth === "caesarean" ? [CAESAREAN] : []), ...CALL],
    // Its own words carry the if: "you've been told", so it reads true unanswered too.
    tripleZero: [...(mayBeBreech(facts) ? [BREECH] : []), ...TRIPLE_ZERO],
  };
}
