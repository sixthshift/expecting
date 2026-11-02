import { TriangleAlert } from "lucide-react";
import { useAnswersQuery } from "../../../../api/rpc/facts";
import { usePeopleQuery } from "../../../../api/rpc/people";
import { useQuietQuery } from "../../../../api/rpc/quiet";
import { useSettingsQuery } from "../../../../api/rpc/settings";
import { formatDate, isISODate, todayISO } from "../../../../lib/dates";
import { ALWAYS, type EmergencyInfo, telHref } from "../../../../lib/emergency";
import { factsOf } from "../../../../lib/facts";
import { PapersToHand } from "../../../journal/components/entries/papers/PaperList";
import { handover } from "../../model/handover";
import { WarningSigns } from "../warningSigns/WarningSigns";
import { CallChip } from "./CallChip";
import { CallRow } from "./CallRow";
import { ItsTimeLink } from "./ItsTimeLink";

/** Emergency info as read: the calls, the handover, the papers kept handy, when to call, everyone else and the front desk's numbers. */
export function EmergencyView({ emergency }: { emergency: EmergencyInfo }) {
  const { data: settings } = useSettingsQuery();
  const { people } = usePeopleQuery().data;
  const { data: facts } = useAnswersQuery({ select: factsOf });
  const { data: quiet } = useQuietQuery();
  const { values } = emergency;
  const today = todayISO();
  const carrying = people.find((p) => p.role === "carrying");
  const partner = people.find((p) => p.role === "partner");
  const h = handover({
    values,
    facts,
    carrying: carrying?.name ?? null,
    dueDate: settings.dueDate,
    today,
    // After a loss the pregnancy stops counting: a doctor needs the weeks it ended at, and when.
    lostOn: quiet?.kind === "loss" ? todayISO(new Date(quiet.setAt)) : null,
  });
  const changedBy = emergency.changed?.by ? people.find((p) => p.id === emergency.changed?.by)?.name : undefined;
  const changedOn = emergency.changed ? emergency.changed.at.slice(0, 10) : undefined;

  return (
    <>
      <nav aria-label="Call" className="flex gap-2">
        <CallChip phone="000" label="Call 000" text="000" />
        {values.birthSuitePhone ? <CallChip phone={values.birthSuitePhone} label="Call the birth suite" text="Birth suite" /> : null}
        {values.carerPhone ? (
          <CallChip shrink phone={values.carerPhone} label={`Call ${values.carer ?? "the midwife or obstetrician"}`} text={values.carer ?? "Midwife or OB"} />
        ) : null}
      </nav>

      <section aria-label="For whoever is treating her" className="flex flex-col overflow-hidden rounded-xl border border-border-subtle bg-bg-normal">
        <header className="flex flex-col gap-0.5 bg-linear-to-br from-(--expecting-accent-soft-from) to-(--expecting-accent-soft-to) px-4 py-3 sm:px-6">
          <p className="font-display text-xl font-semibold text-fg-strong">
            {h.name ?? "Pregnant"}
            {h.born ? <span className="font-normal text-fg-normal">, {h.born.age}</span> : null}
          </p>
          {h.born ? <p className="text-sm text-fg-normal">Born {formatDate(h.born.date, { day: "numeric", month: "short", year: "numeric" })}</p> : null}
          {h.pregnancy ? <p className="font-medium text-fg-strong">{h.pregnancy}</p> : null}
        </header>
        {h.rows.length > 0 ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 px-4 py-1 sm:px-6">
            {h.rows.map((r) => (
              <div
                key={r.id}
                className={
                  r.alert
                    ? "-mx-4 col-span-2 grid grid-cols-subgrid border-border-danger border-y bg-bg-danger-subtle px-4 py-2 sm:-mx-6 sm:px-6"
                    : "col-span-2 grid grid-cols-subgrid border-border-subtle border-b py-2 last:border-b-0"
                }
              >
                <dt className={r.alert ? "flex items-start gap-1 text-sm font-semibold text-fg-danger" : "text-sm text-fg-subtle"}>
                  {r.alert ? <TriangleAlert aria-hidden size={14} className="mt-0.5" /> : null}
                  {r.label}
                </dt>
                <dd className={r.alert ? "whitespace-pre-line font-semibold text-fg-strong" : "whitespace-pre-line text-fg-strong"}>
                  {r.value}
                  {r.phone ? (
                    <>
                      {" "}
                      <a href={telHref(r.phone)} className="whitespace-nowrap font-medium text-fg-brand underline">
                        {r.phone}
                      </a>
                    </>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
        {h.missing.length > 0 ? (
          <p className="border-border-subtle border-t bg-bg-subtle px-4 py-2 text-sm text-fg-subtle sm:px-6">Still blank: {h.missing.join(", ")}.</p>
        ) : null}
      </section>

      <ItsTimeLink />

      <PapersToHand />

      <WarningSigns />

      <section aria-labelledby="emergency-others" className="flex flex-col gap-3">
        <h2 id="emergency-others" className="text-sm font-semibold tracking-wide text-fg-subtle uppercase">
          Everyone else to call
        </h2>
        <ul className="flex flex-col divide-y divide-border-subtle rounded-xl border border-border-subtle bg-bg-normal">
          {values.partnerPhone ? <CallRow label={partner?.name ?? "The other parent"} phone={values.partnerPhone} /> : null}
          {values.gp || values.gpPhone ? <CallRow label="GP" about={values.gp} phone={values.gpPhone} /> : null}
          {values.support ? <CallRow label="Someone else" about={values.support} /> : null}
          {values.minder || values.minderPhone ? <CallRow label="Minding the kids or pets" about={values.minder} phone={values.minderPhone} /> : null}
          {values.backupDriver || values.backupDriverPhone ? (
            <CallRow label="If you can't drive" about={values.backupDriver} phone={values.backupDriverPhone} />
          ) : null}
          {ALWAYS.filter((n) => n.phone !== "000").map((n) => (
            <CallRow key={n.phone} label={n.label} about={n.about} phone={n.phone} />
          ))}
        </ul>
      </section>

      {values.medicare || values.healthFund ? (
        <section aria-labelledby="emergency-desk" className="flex flex-col gap-3">
          <h2 id="emergency-desk" className="text-sm font-semibold tracking-wide text-fg-subtle uppercase">
            For the front desk
          </h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 rounded-xl border border-border-subtle bg-bg-normal px-4 py-1">
            {[
              ["Medicare", values.medicare],
              ["Health fund", values.healthFund],
            ].flatMap(([label, value]) =>
              value ? (
                <div key={label} className="col-span-2 grid grid-cols-subgrid border-border-subtle border-b py-2 last:border-b-0">
                  <dt className="text-sm text-fg-subtle">{label}</dt>
                  <dd className="text-fg-strong">{value}</dd>
                </div>
              ) : (
                []
              )
            )}
          </dl>
        </section>
      ) : null}

      {changedOn && isISODate(changedOn) ? (
        <p className="text-sm text-fg-subtle">
          Last changed {changedBy ? `by ${changedBy} ` : ""}on {formatDate(changedOn)}.
        </p>
      ) : null}
    </>
  );
}
