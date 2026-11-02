import type { CirclePerson, groupsOf, View } from "../../../../../../lib/drawer/circle";
import { PersonRow } from "../person/PersonRow";

/** Your people in the view's groups, a heading each; or, with nobody yet, how to start. */
export function Grouped({
  people,
  groups,
  view,
  meta,
}: {
  people: readonly CirclePerson[];
  groups: ReturnType<typeof groupsOf>;
  view: View;
  meta?: (p: CirclePerson) => string;
}) {
  if (people.length === 0) return <p className="text-sm text-fg-subtle">Nobody yet. Add someone below.</p>;
  return (
    <div className="flex flex-col gap-4">
      {groups.map((g) => (
        <section key={g.key} aria-label={g.title} className="flex flex-col">
          <h2 className="text-sm font-semibold text-fg-normal">{g.title}</h2>
          {g.people.map((p) => (
            <PersonRow key={p.id} person={p} view={view} meta={meta?.(p)} />
          ))}
        </section>
      ))}
    </div>
  );
}
