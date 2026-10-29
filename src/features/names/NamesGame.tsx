import { Button } from "@sixthshift/design-system/button";
import { Input } from "@sixthshift/design-system/input";
import { Heart, Plus, Trash2, X } from "lucide-react";
import { type FormEvent, useState } from "react";
import { addName, removeName, voteName } from "../../api/rpc/names";
import { type NamesView, nextToVote } from "../../lib/names";
import type { Person } from "../../lib/people";
import { useAction } from "../household/useAction";

/**
 * The names game: either of you adds names, and each votes on your own phone.
 * A name is a match only when you both like it, so nobody has to admit to the
 * name the other would hate. Only your own votes are ever shown to you.
 */
export function NamesGame({ view, other }: { view: NamesView; other: Person | null }) {
  const [vote, voting] = useAction((id: string, liked: boolean) => voteName({ data: { id, liked } }));
  const [remove] = useAction((id: string) => removeName({ data: { id } }));
  const next = nextToVote(view);
  const left = view.names.filter((n) => n.mine === null).length;
  const liked = view.names.filter((n) => n.mine === true);
  const passed = view.names.filter((n) => n.mine === false);

  return (
    <section aria-labelledby="names" className="flex flex-col gap-5 rounded-xl border border-border-subtle bg-bg-normal p-4 sm:p-6">
      <div className="flex flex-col gap-1">
        <h2 id="names" className="font-display text-xl font-semibold text-fg-strong">
          Baby names
        </h2>
        <p className="text-sm text-fg-subtle">Add names, and like or pass on each one on your own phone. A name is a match only when you both like it.</p>
      </div>

      <section
        aria-label="Matches"
        className="flex flex-col gap-2 rounded-lg bg-linear-to-br from-(--expecting-accent-soft-from) to-(--expecting-accent-soft-to) p-4"
      >
        <h3 className="text-sm font-semibold text-fg-strong">
          {view.matches.length === 0 ? "No matches yet" : `You both like ${view.matches.length === 1 ? "one name" : `${view.matches.length} names`}`}
        </h3>
        {view.matches.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {view.matches.map((m) => (
              <li key={m.id} className="rounded-full bg-bg-normal px-3 py-1 font-display text-lg text-fg-strong">
                {m.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-fg-normal">
            {view.together
              ? "When a name you like is one the other likes too, it shows up here."
              : `Once ${other?.name ?? "your partner"} joins on their own phone, names you both like show up here.`}
          </p>
        )}
      </section>

      {next ? (
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <span className="text-xs text-fg-subtle">{left === 1 ? "1 name to go" : `${left} names to go`}</span>
          <p className="font-display text-4xl font-semibold text-fg-strong">{next.name}</p>
          <div className="flex gap-3">
            <Button variant="outline" size="lg" disabled={voting} onClick={() => vote(next.id, false)} aria-label={`Pass on ${next.name}`}>
              <X aria-hidden size={18} /> Pass
            </Button>
            <Button intent="brand" size="lg" disabled={voting} onClick={() => vote(next.id, true)} aria-label={`Like ${next.name}`}>
              <Heart aria-hidden size={18} /> Like
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-fg-subtle">{view.names.length === 0 ? "No names yet. Add the first." : "You've voted on every name. Add some more."}</p>
      )}

      <AddName />

      {liked.length + passed.length > 0 ? (
        <details className="group">
          <summary className="min-h-11 cursor-pointer text-sm text-fg-subtle underline">
            Your votes ({liked.length} liked, {passed.length} passed)
          </summary>
          <ul className="mt-2 divide-y divide-border-subtle">
            {[...liked, ...passed].map((n) => (
              <li key={n.id} className="flex items-center gap-2 py-2">
                <span className="flex-1 text-fg-strong">{n.name}</span>
                <span className="text-xs text-fg-subtle">{n.mine ? "Liked" : "Passed"}</span>
                <Button variant="ghost" size="sm" onClick={() => vote(n.id, !n.mine)}>
                  {n.mine ? "Pass instead" : "Like instead"}
                </Button>
                <Button variant="ghost" size="sm" iconOnly aria-label={`Remove ${n.name} from the game`} onClick={() => remove(n.id)}>
                  <Trash2 aria-hidden size={16} />
                </Button>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}

function AddName() {
  const [name, setName] = useState("");
  const [add, saving] = useAction(async () => {
    await addName({ data: { name } });
    setName("");
  });

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (name.trim().length > 0) await add();
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Add a name you like"
        aria-label="A name to add"
        maxLength={60}
        className="flex-1"
      />
      <Button type="submit" variant="outline" iconOnly aria-label="Add name" loading={saving} disabled={name.trim().length === 0}>
        <Plus aria-hidden size={16} />
      </Button>
    </form>
  );
}
