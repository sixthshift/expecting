import { Button } from "@sixthshift/design-system/button";
import { DatePicker } from "@sixthshift/design-system/date-picker";
import { FormField } from "@sixthshift/design-system/form-field";
import { Input } from "@sixthshift/design-system/input";
import { Modal } from "@sixthshift/design-system/modal";
import { ToggleGroup } from "@sixthshift/design-system/toggle-group";
import { type FormEvent, useState } from "react";
import { circleSaves } from "../../../../api/rpc/circle";
import { useSave } from "../../../../app/hooks/useSave";
import { type CirclePerson, HEARS, type Hears, type PersonPatch, VISITS, type View, type Visit } from "../../../../lib/circle";
import type { ISODate } from "../../../../lib/dates";

const NONE = "none";

/**
 * Someone opened, at a view: their name and a few words, and what this view
 * sets (when they visit, when they hear, what they'll help with and their
 * day on the meal train). Deleting them asks first: what they gave goes too.
 */
export function PersonSheet({ person, view, onClose }: { person: CirclePerson; view: View; onClose: () => void }) {
  const [name, setName] = useState(person.name);
  const [note, setNote] = useState(person.note ?? "");
  const [visit, setVisit] = useState<Visit | null>(person.visit);
  const [hears, setHears] = useState<Hears | null>(person.hears);
  const [help, setHelp] = useState(person.help ?? "");
  const [mealDay, setMealDay] = useState<ISODate | null>(person.mealDay);
  const [confirming, setConfirming] = useState(false);
  const rename = useSave(circleSaves.renameCirclePerson);
  const set = useSave(circleSaves.setCirclePerson);
  const remove = useSave(circleSaves.deleteCirclePerson);

  function submit(event: FormEvent) {
    event.preventDefault();
    const words = note.trim() || null;
    if (name.trim().length > 0 && (name.trim() !== person.name || words !== person.note)) rename({ id: person.id, name, note: words });
    const patch: PersonPatch = {};
    if (view === "visitors" && visit !== person.visit) patch.visit = visit;
    if (view === "hearing" && hears !== person.hears) patch.hears = hears;
    if (view === "help" && (help.trim() || null) !== person.help) patch.help = help;
    if (view === "help" && mealDay !== person.mealDay) patch.mealDay = mealDay;
    if (Object.keys(patch).length > 0) set({ id: person.id, patch });
    onClose();
  }

  return (
    <Modal size="sm" align="top" closable onOpenChange={(open) => (open ? null : onClose())} aria-label={person.name}>
      <Modal.Header>
        <h2 className="font-display text-lg font-semibold text-fg-strong">{person.name}</h2>
      </Modal.Header>
      <Modal.Body className="px-6 pb-6">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Input value={name} onChange={(e) => setName(e.target.value)} aria-label="Name" maxLength={80} />
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="A few words: Sam's sister, a number"
            aria-label="A few words"
            maxLength={200}
          />
          {view === "visitors" ? (
            <Choice label="When they're welcome" options={VISITS} value={visit} onChange={setVisit} />
          ) : view === "hearing" ? (
            <Choice label="When they hear" options={HEARS} value={hears} onChange={setHears} />
          ) : view === "help" ? (
            <>
              <Input
                value={help}
                onChange={(e) => setHelp(e.target.value)}
                placeholder="What they'll help with: the school run, a clean"
                aria-label="Their help"
                maxLength={200}
              />
              <FormField label="Their day on the meal train">
                <DatePicker
                  value={mealDay ?? undefined}
                  onChange={(d) => setMealDay((d as ISODate | undefined) ?? null)}
                  segmentOrder="dmy"
                  weekStartsOn={1}
                  clearable
                />
              </FormField>
            </>
          ) : null}
          {confirming ? (
            <div className="flex flex-col gap-2 rounded-md border border-border-subtle p-3">
              <p className="text-sm text-fg-normal">Delete {person.name}? What they gave goes too.</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  intent="danger"
                  size="sm"
                  onClick={() => {
                    remove({ id: person.id });
                    onClose();
                  }}
                >
                  Delete
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                  Keep them
                </Button>
              </div>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" intent="brand" size="sm">
              Save
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            {confirming ? null : (
              <Button type="button" variant="ghost" intent="danger" size="sm" className="ml-auto" onClick={() => setConfirming(true)}>
                Delete
              </Button>
            )}
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}

/** One of a view's values, or not decided. */
function Choice<K extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Record<K, string>;
  value: K | null;
  onChange: (k: K | null) => void;
}) {
  return (
    <ToggleGroup
      type="single"
      appearance="separate"
      variant="outline"
      intent="brand"
      aria-label={label}
      className="flex-wrap"
      value={value ?? NONE}
      onValueChange={(v) => onChange(v === "" || v === NONE ? null : (v as K))}
      options={[...(Object.entries(options) as [K, string][]).map(([v, l]) => ({ value: v, label: l })), { value: NONE, label: "Not decided" }]}
    />
  );
}
