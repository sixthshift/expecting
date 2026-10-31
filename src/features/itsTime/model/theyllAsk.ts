// When you ring, they'll ask: the phone call, already answered, in the order a
// midwife asks, from what's kept. Blank ones are left out, like the handover.
// The baby's movements are never filled in: that's hers to say.

import { formatDate, type ISODate } from "../../../lib/dates";
import { clock, type Pattern, type Start, sayPattern, WATERS_LABEL } from "../../../lib/itsTime";
import type { Role } from "../../../lib/people";
import { gestationLabel, positionOn } from "../../../lib/timeline";
import type { Facts } from "../../settings/model/facts";

export type AskRow = { key: string; label: string; value: string };

const BABIES: Record<string, string> = { twins: "Twins", more: "More than two babies" };

export function theyllAsk({
  values: v,
  facts,
  carrying,
  dueDate,
  today,
  start,
  pattern,
  holding,
}: {
  values: Readonly<Record<string, string>>;
  facts: Facts;
  /** The carrying parent's name in the app, until the full name is filled in. */
  carrying: string | null;
  dueDate: ISODate | null;
  today: ISODate;
  start: Start | null;
  pattern: Pattern | null;
  /** Who's holding this phone: the movements are asked of her, or said by her. */
  holding: Role | null;
}): AskRow[] {
  const rows: AskRow[] = [];
  const row = (key: string, label: string, value: string | null | undefined | false) => {
    if (value) rows.push({ key, label, value });
  };
  const name = v.fullName ?? carrying;
  row("name", "Name", [name, v.hospitalRecord && `record ${v.hospitalRecord}`].filter(Boolean).join(", "));
  if (dueDate) {
    const at = positionOn(today, dueDate);
    row("weeks", "How far", `${gestationLabel(at.gestationDays)} weeks, due ${formatDate(dueDate, { weekday: "short", day: "numeric", month: "short" })}`);
  }
  row("first", "First baby?", facts.firstBaby === "yes" ? "Yes" : facts.firstBaby === "no" ? "No" : null);
  row("caesarean", "A caesarean before?", facts.previousCaesarean === "yes" ? "Yes" : null);
  row("babies", "How many", facts.babies ? BABIES[facts.babies] : null);
  row("planned", "Planned caesarean", facts.birth === "caesarean" ? "Yes" : null);
  row("presentation", "Head down?", facts.presentation === "breech" ? "We've been told not" : null);
  if (start?.watersAt) row("waters", "Waters", `Broke ${clock(start.watersAt)}${start.waters ? `, ${WATERS_LABEL[start.waters].toLowerCase()}` : ""}`);
  const said = pattern ? sayPattern(pattern) : null;
  if (said && pattern) row("contractions", "Contractions", `${said.charAt(0).toUpperCase()}${said.slice(1)} · ${pattern.inTen} in the last 10 min`);
  row("moving", "Baby moving?", holding === "carrying" ? "Say what you've felt" : "Ask her");
  row("else", "Anything else", v.pregnancy);
  return rows;
}
