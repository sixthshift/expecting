import { Button } from "@sixthshift/design-system/button";
import { FormField } from "@sixthshift/design-system/form-field";
import { Input } from "@sixthshift/design-system/input";
import { cn } from "@sixthshift/design-system/utils";
import { Check } from "lucide-react";
import { type FormEvent, useState } from "react";
import { addPerson, becomePerson } from "../../../../api/rpc/people";
import { type Person, ROLES, type Role } from "../../../../lib/people";
import type { Advance, Screen, StepContext } from "../../model/step";
import { Choices } from "../parts";

/** Who's holding this phone: someone new, or one of the household's people. */
export function whoStep({ people, advance }: StepContext): Screen {
  return people.length === 0
    ? {
        title: "Welcome to Expecting. Who's holding this phone?",
        lead: "Expecting is for both of you, on both your phones. It just needs to know who's who; there are no accounts.",
        body: <NewPerson people={people} onDone={advance} />,
      }
    : {
        title: "Who's this?",
        lead: "Expecting is shared; this phone just needs to know whose it is.",
        body: <WhoIsThis people={people} onDone={advance} />,
      };
}

function WhoIsThis({ people, onDone }: { people: Person[]; onDone: Advance }) {
  const [someoneElse, setSomeoneElse] = useState(false);
  if (someoneElse) return <NewPerson people={people} onDone={onDone} />;
  return (
    <div className="flex flex-col gap-4">
      <Choices options={people.map((p) => ({ value: p.id, label: `I'm ${p.name}` }))} onChoose={(id) => onDone(() => becomePerson({ data: { id } }))} />
      <button type="button" onClick={() => setSomeoneElse(true)} className="min-h-11 self-start text-sm text-fg-subtle underline hover:text-fg-normal">
        Someone else
      </button>
    </div>
  );
}

function NewPerson({ people, onDone }: { people: Person[]; onDone: Advance }) {
  const [name, setName] = useState("");
  // The second person is most likely the other role.
  const [role, setRole] = useState<Role | undefined>(people.length === 1 ? (people[0]!.role === "carrying" ? "partner" : "carrying") : undefined);
  const [saving, setSaving] = useState(false);
  const ready = name.trim().length > 0 && role !== undefined;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready) return;
    setSaving(true);
    try {
      await onDone(() => addPerson({ data: { name, role } }));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <FormField label="Your name">
        <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" maxLength={60} className="h-12 text-base" />
      </FormField>
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-sm font-medium text-fg-normal">Which of you is this?</legend>
        {(Object.keys(ROLES) as Role[]).map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={role === r}
            onClick={() => setRole(r)}
            className={cn(
              "flex min-h-14 w-full items-center gap-3 rounded-xl border bg-bg-normal px-4 py-3 text-left text-base transition-colors hover:border-border-brand-hovered",
              role === r ? "border-border-brand bg-bg-brand-subtle text-fg-on-brand-subtle" : "border-border-normal text-fg-strong"
            )}
          >
            <span className="flex-1">{ROLES[r]}</span>
            {role === r ? <Check aria-hidden size={18} className="text-fg-brand" /> : null}
          </button>
        ))}
      </fieldset>
      <Button type="submit" intent="brand" size="xl" loading={saving} disabled={!ready} className="w-full">
        Continue
      </Button>
    </form>
  );
}
