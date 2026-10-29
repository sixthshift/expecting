import { Button } from "@sixthshift/design-system/button";
import { FormField } from "@sixthshift/design-system/form-field";
import { Input } from "@sixthshift/design-system/input";
import { Textarea } from "@sixthshift/design-system/textarea";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Pencil, Phone } from "lucide-react";
import { type FormEvent, useState } from "react";
import { saveEmergency, useEmergency } from "../../api/rpc/emergency";
import { useAnswers } from "../../api/rpc/facts";
import { usePeople } from "../../api/rpc/people";
import { usePosition, useSettings } from "../../api/rpc/settings";
import { formatDate, isISODate } from "../../lib/dates";
import { ALWAYS, EMERGENCY, EMERGENCY_FIELDS, EMERGENCY_MAX, type EmergencyField, type EmergencyInfo, telHref } from "../../lib/emergency";
import { factsOf } from "../../lib/facts";
import { gestationLabel } from "../../lib/timeline";
import { useAction } from "../app/useAction";
import { question, UNSURE } from "../settings/model/facts";

/** The answers a doctor or paramedic would ask about, as the page shows them. */
const FROM_ANSWERS: readonly { id: string; label: string }[] = [
  { id: "babies", label: "Babies" },
  { id: "firstBaby", label: "First baby" },
  { id: "previousCaesarean", label: "Caesarean before" },
  { id: "birth", label: "Planned birth" },
  { id: "rhd", label: "RhD negative" },
];

/**
 * Emergency info: the one page to open when something goes wrong, or labour starts.
 * The pregnancy at a glance, who to call (each number a call button), what a
 * doctor will ask and the numbers you'll be asked for. Both of you fill it in.
 */
export function EmergencyPage() {
  const { data: emergency } = useEmergency();
  const [editing, setEditing] = useState(false);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-16 md:px-8 lg:pt-8">
      <Link to="/drawer" className="-ml-2 flex min-h-11 w-fit items-center gap-2 rounded-md px-2 text-sm text-fg-subtle hover:text-fg-normal">
        <ArrowLeft aria-hidden size={16} /> Drawer
      </Link>
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-semibold text-fg-strong lg:text-3xl">Emergency info</h1>
          <p className="max-w-prose text-fg-subtle">Everything you'd want in a hurry, on one page. Fill it in now, while there's no hurry.</p>
        </div>
        {editing ? null : (
          <Button variant="outline" onClick={() => setEditing(true)} className="shrink-0">
            <Pencil aria-hidden size={16} /> Edit
          </Button>
        )}
      </header>
      {editing ? <EmergencyForm emergency={emergency} done={() => setEditing(false)} /> : <EmergencyView emergency={emergency} />}
    </main>
  );
}

function EmergencyView({ emergency }: { emergency: EmergencyInfo }) {
  const { data: settings } = useSettings();
  const { people } = usePeople().data;
  const position = usePosition();
  const { data: facts } = useAnswers({ select: factsOf });
  const carrying = people.find((p) => p.role === "carrying");
  const { dueDate } = settings;
  const answered = FROM_ANSWERS.flatMap(({ id, label }) => {
    const value = facts[id];
    const said = value && value !== UNSURE ? question(id)?.answers[value] : undefined;
    return said ? [{ id, label, said }] : [];
  });
  const changedBy = emergency.changed?.by ? people.find((p) => p.id === emergency.changed?.by)?.name : undefined;
  const changedOn = emergency.changed ? emergency.changed.at.slice(0, 10) : undefined;

  return (
    <>
      <section
        aria-label="The pregnancy"
        className="flex flex-col gap-3 rounded-xl bg-linear-to-br from-(--expecting-accent-soft-from) to-(--expecting-accent-soft-to) p-4 sm:p-6"
      >
        <p className="font-display text-xl font-semibold text-fg-strong">
          {carrying ? `${carrying.name}, ` : ""}
          {position ? `${gestationLabel(position.gestationDays)} weeks pregnant` : "pregnant"}
        </p>
        {dueDate ? <p className="text-fg-normal">Due {formatDate(dueDate)}</p> : null}
        {answered.length > 0 ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            {answered.map((a) => (
              <div key={a.id} className="contents">
                <dt className="text-fg-subtle">{a.label}</dt>
                <dd className="text-fg-strong">{a.said}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </section>

      {EMERGENCY.map((group) => (
        <section key={group.id} aria-labelledby={`emergency-${group.id}`} className="flex flex-col gap-3">
          <h2 id={`emergency-${group.id}`} className="text-sm font-semibold tracking-wide text-fg-subtle uppercase">
            {group.title}
          </h2>
          <dl className="flex flex-col divide-y divide-border-subtle rounded-xl border border-border-subtle bg-bg-normal">
            {group.fields.map((field) => (
              <ViewRow key={field.id} field={field} value={emergency.values[field.id]} />
            ))}
          </dl>
          {group.id === "call" ? (
            <ul className="flex flex-col divide-y divide-border-subtle rounded-xl border border-border-subtle bg-bg-normal">
              {ALWAYS.map((n) => (
                <li key={n.phone} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-fg-strong">{n.label}</span>
                    <span className="text-sm text-fg-subtle">{n.about}</span>
                  </div>
                  <CallLink phone={n.phone} />
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}

      {changedOn && isISODate(changedOn) ? (
        <p className="text-sm text-fg-subtle">
          Last changed {changedBy ? `by ${changedBy} ` : ""}on {formatDate(changedOn)}.
        </p>
      ) : null}
    </>
  );
}

function ViewRow({ field, value }: { field: EmergencyField; value: string | undefined }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 flex-col">
        <dt className="text-sm text-fg-subtle">{field.label}</dt>
        <dd className={value ? "whitespace-pre-line text-fg-strong" : "text-fg-subtle italic"}>{value ?? "Not filled in"}</dd>
      </div>
      {value && field.kind === "phone" ? <CallLink phone={value} /> : null}
    </div>
  );
}

function CallLink({ phone }: { phone: string }) {
  return (
    <a
      href={telHref(phone)}
      aria-label={`Call ${phone}`}
      className="flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-bg-brand-strong px-4 text-sm font-medium text-fg-on-brand-strong hover:bg-bg-brand-strong-hovered"
    >
      <Phone aria-hidden size={16} /> {phone}
    </a>
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
          {group.fields.map((field) => (
            <FormField key={field.id} label={field.label} description={field.hint}>
              {field.kind === "lines" ? (
                <Textarea value={draft[field.id]} onChange={set(field.id)} rows={2} autosize maxLength={EMERGENCY_MAX} />
              ) : (
                <Input
                  value={draft[field.id]}
                  onChange={set(field.id)}
                  maxLength={EMERGENCY_MAX}
                  {...(field.kind === "phone" ? { type: "tel", inputMode: "tel", autoComplete: "off" } : {})}
                />
              )}
            </FormField>
          ))}
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
