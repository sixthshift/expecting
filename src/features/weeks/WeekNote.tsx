import { Badge } from "@sixthshift/design-system/badge";
import { Card } from "@sixthshift/design-system/card";
import { ExternalLink } from "lucide-react";
import { type WeekNote as Note, SECTIONS, type Section, sizeLabel } from "../../content/weeks";
import { formatDate, type ISODate } from "../../lib/dates";
import { ItemBody } from "../library/content/ItemBody";

const ORDER = Object.keys(SECTIONS) as Section[];

/** This week, at the top of its week: the baby, your body, and the partner. */
export function WeekNote({ note }: { note: Note }) {
  const size = note.size ? sizeLabel(note.size) : null;
  return (
    <Card>
      <article aria-labelledby={`note-${note.key}`} className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold tracking-widest text-fg-subtle uppercase">This week</span>
          {note.draft ? (
            <Badge size="sm" variant="outline" intent="warning" title="Drafted, not yet reviewed">
              Draft
            </Badge>
          ) : null}
        </div>
        <h3 id={`note-${note.key}`} className="text-lg leading-snug font-semibold text-fg-strong">
          {note.title}
        </h3>
        {size ? <p className="text-sm text-fg-subtle">{size.charAt(0).toUpperCase() + size.slice(1)}.</p> : null}
        {ORDER.map((section) => (
          <section key={section} className="max-w-prose">
            <h4 className="text-sm font-semibold text-fg-brand">{SECTIONS[section]}</h4>
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
