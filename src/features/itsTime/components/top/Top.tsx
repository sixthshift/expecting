import { Link } from "@tanstack/react-router";
import { ChevronRight, TriangleAlert } from "lucide-react";
import { clock, type Start, TERM_WEEK, WATERS_LABEL } from "../../../../lib/itsTime";
import type { Person } from "../../../../lib/people";
import { gestationLabel, type Position } from "../../../../lib/timeline";
import { CallButton } from "../CallButton";

/**
 * The top: where it's at in one line, then the calls. The birth suite (the
 * midwife, for a home birth) and 000; before 37 weeks the line that says go in;
 * the call a tap of yours has set off (green or brown waters, or the waters
 * with a baby you've been told isn't head-first) above them all; and who's
 * holding the phone changes what comes first.
 */
export function Top({
  start,
  position,
  values,
  home,
  breechWaters,
  me,
  partner,
}: {
  start: Start | null;
  position: Position | null;
  values: Readonly<Record<string, string>>;
  home: boolean;
  breechWaters: boolean;
  me: Person | null;
  partner: Person | null;
}) {
  const first = home ? values.carerPhone : values.birthSuitePhone;
  const firstLabel = home ? `Call ${values.carer ?? "the midwife"}` : "Call the birth suite";
  const early = position !== null && position.week < TERM_WEEK;
  const colour = start?.waters === "green-brown-blood";
  // Her phone, and the other parent didn't start it: they may not know yet.
  const ringPartner = me?.role === "carrying" && partner && values.partnerPhone && start && start.by !== partner.id ? partner : null;

  const state = start
    ? [
        `Started ${clock(start.startedAt)}`,
        start.watersAt ? `waters ${clock(start.watersAt)}${start.waters ? `, ${WATERS_LABEL[start.waters].split(",")[0]!.toLowerCase()}` : ""}` : null,
        position ? `week ${gestationLabel(position.gestationDays)}` : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : null;

  return (
    <div className="flex flex-col gap-3">
      {state ? <p className="font-medium text-fg-strong">{state}</p> : null}

      {breechWaters ? (
        <Alarm>
          The waters have broken and you've been told the baby isn't head-first: call 000 and ask for an ambulance. There's a higher risk of cord prolapse.
        </Alarm>
      ) : null}
      {colour ? (
        <Alarm>Green, brown or blood-coloured waters: call {home ? "your midwife" : "the birthing unit"} now for advice, or go to hospital.</Alarm>
      ) : null}
      {early ? (
        <p className="rounded-xl border border-border-subtle bg-bg-subtle px-4 py-3 text-fg-strong">
          Before 37 weeks, contractions or the waters breaking mean calling {home ? "your midwife" : "the birth suite"} and going in to hospital.
        </p>
      ) : null}
      {start && me?.role === "partner" ? <p className="text-fg-normal">You ring, you drive, you time.</p> : null}

      <nav aria-label="The calls" className="flex flex-col gap-2 sm:flex-row">
        {ringPartner ? (
          <CallButton phone={values.partnerPhone!} tone="strong">
            Call {ringPartner.name}
          </CallButton>
        ) : null}
        {breechWaters ? (
          <CallButton phone="000" tone="danger">
            Call 000
          </CallButton>
        ) : null}
        {first ? (
          <CallButton phone={first} tone={ringPartner || breechWaters ? "plain" : colour ? "danger" : "strong"}>
            {firstLabel}
          </CallButton>
        ) : (
          <Link
            to="/emergency"
            className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-xl border border-border-normal border-dashed px-4 font-semibold text-fg-brand"
          >
            {home ? "Add the midwife's number" : "Add the birth suite's number"}
            <ChevronRight aria-hidden size={18} />
          </Link>
        )}
        {breechWaters ? null : <CallButton phone="000">Call 000</CallButton>}
      </nav>
    </div>
  );
}

/** The danger colour, kept for a call your own tap has set off. */
function Alarm({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="flex gap-2 rounded-xl border border-border-danger bg-bg-danger-subtle px-4 py-3 font-semibold text-fg-strong">
      <TriangleAlert aria-hidden size={20} className="mt-0.5 shrink-0 text-fg-danger" />
      <span>{children}</span>
    </p>
  );
}
