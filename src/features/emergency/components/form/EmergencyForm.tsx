import { Button } from "@sixthshift/design-system/button";
import { Checkbox } from "@sixthshift/design-system/checkbox";
import { FormField } from "@sixthshift/design-system/form-field";
import { Input } from "@sixthshift/design-system/input";
import { Textarea } from "@sixthshift/design-system/textarea";
import { type FormEvent, useState } from "react";
import { emergencySaves } from "../../../../api/rpc/emergency";
import { useSave } from "../../../../app/hooks/useSave";
import { EMERGENCY, EMERGENCY_FIELDS, EMERGENCY_MAX, type EmergencyInfo, TICKED } from "../../../../lib/emergency";

/** Emergency info being filled in: every field, by its group, saved together. */
export function EmergencyForm({ emergency, done }: { emergency: EmergencyInfo; done: () => void }) {
  const [draft, setDraft] = useState<Record<string, string>>(() => Object.fromEntries(EMERGENCY_FIELDS.map((f) => [f.id, emergency.values[f.id] ?? ""])));
  const save = useSave(emergencySaves.saveEmergency);
  const set = (id: string) => (e: { target: { value: string } }) => setDraft((d) => ({ ...d, [id]: e.target.value }));

  function submit(e: FormEvent) {
    e.preventDefault();
    save(draft);
    done();
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
        <Button type="submit">Save</Button>
        <Button type="button" variant="outline" onClick={done}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
