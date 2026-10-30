import { Button } from "@sixthshift/design-system/button";
import { Checkbox } from "@sixthshift/design-system/checkbox";
import { FormField } from "@sixthshift/design-system/form-field";
import { Input } from "@sixthshift/design-system/input";
import { Textarea } from "@sixthshift/design-system/textarea";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Pencil, Phone, TriangleAlert } from "lucide-react";
import { type FormEvent, useState } from "react";
import { saveEmergency, useEmergency } from "../../../api/rpc/emergency";
import { useAnswers } from "../../../api/rpc/facts";
import { usePeople } from "../../../api/rpc/people";
import { useQuiet } from "../../../api/rpc/quiet";
import { useSettings } from "../../../api/rpc/settings";
import { useAction } from "../../../app/hooks/useAction";
import { formatDate, isISODate, todayISO } from "../../../lib/dates";
import { ALWAYS, EMERGENCY, EMERGENCY_FIELDS, EMERGENCY_MAX, type EmergencyInfo, TICKED, telHref } from "../../../lib/emergency";
import { factsOf } from "../../../lib/facts";
import { WarningSigns } from "../components/warningSigns/WarningSigns";
import { handover } from "../model/handover";

/**
 * Emergency info: the one page to open when something goes wrong, or labour starts,
 * and to hand to whoever is treating her. The calls in one row, then the handover
 * (who, how far along, allergies, blood, the pregnancy, medicines, history, where
 * she's booked), fitting a phone's first screen; below it, when to call, everyone
 * else to call and the front desk's numbers. Both of you fill it in.
 */
export function EmergencyPage() {
  const { data: emergency } = useEmergency();
  const [editing, setEditing] = useState(false);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-16 md:px-8 lg:gap-6 lg:pt-8">
      <div className="flex items-center justify-between gap-3">
        <Link to="/drawer" className="-ml-2 flex min-h-11 w-fit items-center gap-2 rounded-md px-2 text-sm text-fg-subtle hover:text-fg-normal">
          <ArrowLeft aria-hidden size={16} /> Drawer
        </Link>
        {editing ? null : (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="shrink-0">
            <Pencil aria-hidden size={16} /> Edit
          </Button>
        )}
      </div>
      <h1 className="font-display text-2xl font-semibold text-fg-strong lg:text-3xl">Emergency info</h1>
      {editing ? <EmergencyForm emergency={emergency} done={() => setEditing(false)} /> : <EmergencyView emergency={emergency} edit={() => setEditing(true)} />}
    </main>
  );
}

function EmergencyView({ emergency, edit }: { emergency: EmergencyInfo; edit: () => void }) {
  const { data: settings } = useSettings();
  const { people } = usePeople().data;
  const { data: facts } = useAnswers({ select: factsOf });
  const { data: quiet } = useQuiet();
  const { values } = emergency;
  const today = todayISO();
  const carrying = people.find((p) => p.role === "carrying");
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
          <div className="flex flex-wrap items-center justify-between gap-2 border-border-subtle border-t bg-bg-subtle px-4 py-2 sm:px-6">
            <p className="text-sm text-fg-subtle">Still blank: {h.missing.join(", ")}.</p>
            <Button variant="ghost" size="sm" onClick={edit}>
              Fill in
            </Button>
          </div>
        ) : null}
      </section>

      <WarningSigns />

      <section aria-labelledby="emergency-others" className="flex flex-col gap-3">
        <h2 id="emergency-others" className="text-sm font-semibold tracking-wide text-fg-subtle uppercase">
          Everyone else to call
        </h2>
        <ul className="flex flex-col divide-y divide-border-subtle rounded-xl border border-border-subtle bg-bg-normal">
          {values.gp || values.gpPhone ? <CallRow label="GP" about={values.gp} phone={values.gpPhone} /> : null}
          {values.support ? <CallRow label="Someone else" about={values.support} /> : null}
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

/** A number to call, in the row at the top; on a narrow phone, only the one that `shrink`s is cut short to keep the row to one line. */
function CallChip({ phone, label, text, shrink = false }: { phone: string; label: string; text: string; shrink?: boolean }) {
  return (
    <a
      href={telHref(phone)}
      aria-label={label}
      className={`flex min-h-11 items-center justify-center gap-2 rounded-full ${shrink ? "min-w-0" : "shrink-0"} bg-bg-brand-strong px-3 text-sm font-medium text-fg-on-brand-strong hover:bg-bg-brand-strong-hovered sm:px-4`}
    >
      <Phone aria-hidden size={16} className="shrink-0" /> <span className="truncate">{text}</span>
    </a>
  );
}

function CallRow({ label, about, phone }: { label: string; about?: string; phone?: string }) {
  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 flex-col">
        <span className="font-medium text-fg-strong">{label}</span>
        {about ? <span className="whitespace-pre-line text-sm text-fg-subtle">{about}</span> : null}
      </div>
      {phone ? (
        <a
          href={telHref(phone)}
          aria-label={`Call ${phone}`}
          className="flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-border-subtle px-4 text-sm font-medium text-fg-brand hover:bg-bg-subtle-hovered"
        >
          <Phone aria-hidden size={16} /> {phone}
        </a>
      ) : null}
    </li>
  );
}

function EmergencyForm({ emergency, done }: { emergency: EmergencyInfo; done: () => void }) {
  const [draft, setDraft] = useState<Record<string, string>>(() => Object.fromEntries(EMERGENCY_FIELDS.map((f) => [f.id, emergency.values[f.id] ?? ""])));
  const [save, saving] = useAction((values: Record<string, string>) => saveEmergency({ data: values }));
  const set = (id: string) => (e: { target: { value: string } }) => setDraft((d) => ({ ...d, [id]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (await save(draft)) done();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      {EMERGENCY.map((group) => (
        <fieldset key={group.id} className="flex flex-col gap-4">
          <legend className="mb-3 text-sm font-semibold tracking-wide text-fg-subtle uppercase">{group.title}</legend>
          {group.fields.map((field) =>
            field.kind === "tick" ? (
              <Checkbox
                key={field.id}
                label={field.label}
                checked={draft[field.id] === TICKED}
                onCheckedChange={(on) => setDraft((d) => ({ ...d, [field.id]: on ? TICKED : "" }))}
              />
            ) : (
              <FormField key={field.id} label={field.label} description={field.hint}>
                {field.kind === "lines" ? (
                  <Textarea value={draft[field.id]} onChange={set(field.id)} rows={2} autosize maxLength={EMERGENCY_MAX} />
                ) : (
                  <Input
                    value={draft[field.id]}
                    onChange={set(field.id)}
                    maxLength={EMERGENCY_MAX}
                    {...(field.kind === "phone" ? { type: "tel", inputMode: "tel", autoComplete: "off" } : field.kind === "date" ? { type: "date" } : {})}
                  />
                )}
              </FormField>
            )
          )}
        </fieldset>
      ))}
      <div className="sticky bottom-[max(1rem,env(safe-area-inset-bottom))] flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button type="button" variant="outline" onClick={done} disabled={saving}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
