import { Button } from "@sixthshift/design-system/button";
import { Checkbox } from "@sixthshift/design-system/checkbox";
import { Input } from "@sixthshift/design-system/input";
import { Select } from "@sixthshift/design-system/select";
import { X } from "lucide-react";
import { type FormEvent, useState } from "react";
import { circleSaves } from "../../../../api/rpc/circle";
import { useSave } from "../../../../app/hooks/useSave";
import { byName, type CirclePerson, type Gift } from "../../../../lib/circle";
import { newId } from "../../../../lib/outbox";

/**
 * Who gave what, each gift ticked once they've been thanked, by giver; and a
 * gift added to anyone. Kept here, so the thank-yous aren't from memory.
 */
export function Gifts({ people, gifts }: { people: readonly CirclePerson[]; gifts: readonly Gift[] }) {
  const thank = useSave(circleSaves.thankGift);
  const remove = useSave(circleSaves.deleteGift);
  const givers = byName(people).filter((p) => gifts.some((g) => g.personId === p.id));

  return (
    <div className="flex flex-col gap-4">
      {givers.map((p) => (
        <section key={p.id} aria-label={p.name} className="flex flex-col">
          <h2 className="text-sm font-semibold text-fg-normal">{p.name}</h2>
          {gifts
            .filter((g) => g.personId === p.id)
            .map((g) => (
              <div key={g.id} className="flex min-h-11 items-center gap-2">
                <Checkbox
                  checked={g.thankedAt !== null}
                  onCheckedChange={(thanked) => thank({ id: g.id, thanked })}
                  label={
                    <span className={g.thankedAt ? "text-fg-subtle" : undefined}>
                      {g.what}
                      {g.thankedAt ? " · thanked" : ""}
                    </span>
                  }
                  labelClassName="flex-1 min-h-11 items-center"
                />
                <Button variant="ghost" size="sm" iconOnly aria-label={`Delete: ${g.what}`} onClick={() => remove({ id: g.id })}>
                  <X aria-hidden size={16} />
                </Button>
              </div>
            ))}
        </section>
      ))}
      {people.length > 0 ? <AddGift people={people} /> : null}
    </div>
  );
}

function AddGift({ people }: { people: readonly CirclePerson[] }) {
  const [what, setWhat] = useState("");
  const [from, setFrom] = useState<string>("");
  const add = useSave(circleSaves.addGift);
  const ready = what.trim().length > 0 && from !== "";

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready) return;
    add({ id: newId(), personId: from, what });
    setWhat("");
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
      <Input
        value={what}
        onChange={(e) => setWhat(e.target.value)}
        placeholder="A gift: the pram, a knitted blanket"
        aria-label="The gift"
        maxLength={200}
        className="flex-1"
      />
      <Select
        aria-label="From"
        placeholder="From…"
        value={from}
        onValueChange={setFrom}
        options={byName(people).map((p) => ({ value: p.id, label: p.name }))}
      />
      <Button type="submit" intent="brand" disabled={!ready}>
        Add the gift
      </Button>
    </form>
  );
}
