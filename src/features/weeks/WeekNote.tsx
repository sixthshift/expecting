import { Badge } from "@sixthshift/design-system/badge";
import { Card } from "@sixthshift/design-system/card";
import { ToggleGroup } from "@sixthshift/design-system/toggle-group";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { type WeekNote as Note, SECTIONS, type Section, sizeLabel } from "../../content/weeks";
import { formatDate, type ISODate } from "../../lib/dates";
import type { Role } from "../../lib/people";
import { householdQuery } from "../household/load";
import { ItemBody } from "../library/content/ItemBody";

/** What each of you reads: the baby for both, then your own part. */
const LENS: Record<Role, Section[]> = { carrying: ["baby", "body"], partner: ["baby", "partner"] };

/**
 * A week's note: the baby, then the part for whoever is reading, the pregnant
 * parent's body or the partner's. It opens as the person holding this phone,
 * and either of you can flip to read it as the other.
 */
export function WeekNote({
  note,
  showSize = true,
}: {
  note: Note;
  /** Off where the size is already said: This week's heading. */
  showSize?: boolean;
}) {
  const { data: state } = useSuspenseQuery(householdQuery);
  const [lens, setLens] = useState<Role>(state.me?.role ?? "carrying");
  const size = showSize && note.size ? sizeLabel(note.size) : null;
  const named = (role: Role, fallback: string) => {
    const person = state.people.find((p) => p.role === role);
    return person ? `For ${person.name}` : fallback;
  };

  return (
    <Card>
      <article aria-labelledby={`note-${note.week}`} className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold tracking-widest text-fg-subtle uppercase">Week {note.week}</span>
          {note.draft ? (
            <Badge size="sm" variant="outline" intent="warning" title="Drafted, not yet reviewed">
              Draft
            </Badge>
          ) : null}
        </div>
        <h3 id={`note-${note.week}`} className="text-lg leading-snug font-display font-semibold text-fg-strong">
          {note.title}
        </h3>
        {size ? <p className="text-sm text-fg-subtle">{size.charAt(0).toUpperCase() + size.slice(1)}.</p> : null}
        <ToggleGroup
          type="single"
          appearance="segmented"
          size="sm"
          variant="outline"
          intent="brand"
          aria-label="Read the note as"
          className="self-start"
          value={lens}
          onValueChange={(value) => setLens(value as Role)}
          options={[
            { value: "carrying", label: named("carrying", "For the pregnancy") },
            { value: "partner", label: named("partner", "For the partner") },
          ]}
        />
        {LENS[lens].map((section) => (
          <section key={section} className="max-w-prose">
            <h4 className="text-sm font-display font-semibold text-fg-brand">{SECTIONS[section]}</h4>
            <ItemBody doc={note.sections[section]} />
          </section>
        ))}
        {note.source ? (
          <p className="flex flex-wrap items-center gap-x-2 text-xs text-fg-subtle">
            <a href={note.source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline">
              {note.source.title}
              <ExternalLink aria-hidden size={12} />
            </a>
            {note.checked ? <span>checked {formatDate(note.checked as ISODate, { day: "numeric", month: "short", year: "numeric" })}</span> : null}
          </p>
        ) : null}
      </article>
    </Card>
  );
}
