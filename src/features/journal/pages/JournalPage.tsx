import { SearchInput } from "@sixthshift/design-system/search-input";
import { Camera, FileText, Footprints, IceCreamCone, Smile } from "lucide-react";
import { useState } from "react";
import { useJournal } from "../../../api/rpc/journal";
import { useQuiet } from "../../../api/rpc/quiet";
import { useNow, useSettings } from "../../../api/rpc/settings";
import { PillarHeader } from "../../../app/components/layout/PillarLayout";
import { Coming } from "../../../components/Coming";
import { formatDate, type ISODate } from "../../../lib/dates";
import { type EntryGroup, groupEntries, matches } from "../../../lib/journal";
import { type Week, weekDates, weekLabel } from "../../../lib/timeline";
import { AddNote, Note } from "../components/notes/notes";

/**
 * The pregnancy, kept: each entry on its day here, and on its week in the
 * timeline. Notes so far, newest first under their weeks; the rest says
 * what's coming. While something has happened, the notes stay as they were
 * and nothing else is offered.
 */
export function JournalPage() {
  const { data: journal } = useJournal();
  const { data: quiet } = useQuiet();
  const { data: settings } = useSettings();
  const now = useNow();
  const [words, setWords] = useState("");
  const found = journal.filter((e) => matches(e, words));
  const groups = groupEntries(found, settings.dueDate);

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 md:px-8">
      <PillarHeader
        title="Journal"
        lead="What happens, kept. Each note on its day here and on its week in the timeline, so by the birth the timeline is the story of the pregnancy."
      />
      <div className="flex flex-col gap-12">
        <section aria-labelledby="notes" className="flex max-w-2xl flex-col gap-4">
          <h2 id="notes" className="text-lg font-display font-semibold text-fg-strong">
            Notes
          </h2>
          <AddNote />
          {journal.length > 1 ? (
            // Words held on the page, not in the address: what you look for in your notes is yours.
            <SearchInput value={words} onValueChange={setWords} placeholder="Look through your notes" aria-label="Search your notes" />
          ) : null}
          {journal.length > 0 && found.length === 0 ? <p className="text-fg-subtle">No note has those words.</p> : null}
          {groups.map((group) => (
            <section key={group.key} aria-label={heading(group)} className="flex flex-col gap-2">
              <h3 className="flex items-baseline gap-2 text-sm font-semibold text-fg-strong">
                {heading(group)}
                <span className="font-normal text-fg-subtle">{aside(group, settings.dueDate, now)}</span>
              </h3>
              {group.entries.map((entry) => (
                <Note key={entry.id} entry={entry} />
              ))}
            </section>
          ))}
        </section>

        {quiet ? null : (
          <section aria-labelledby="coming" className="flex flex-col gap-3">
            <h2 id="coming" className="text-lg font-display font-semibold text-fg-strong">
              Still to come
            </h2>
            <Coming
              things={[
                {
                  icon: Footprints,
                  title: "Movements",
                  about: "When you feel the baby move, so you know their usual pattern. Any change is a call, never a chart.",
                },
                { icon: IceCreamCone, title: "Cravings and sickness", about: "What and when. Useful when the midwife asks “since when?”, and fun later." },
                { icon: Smile, title: "How you're feeling", about: "A quick mood, with words if you want them. Gentle, never a score." },
                { icon: Camera, title: "Photos and scans", about: "Bump photos and scan images, backed up." },
                { icon: FileText, title: "Results and papers", about: "Blood tests, screening, letters, the birth plan, the discharge summary." },
              ]}
            />
          </section>
        )}
      </div>
    </main>
  );
}

/** "Week 28", "Before the pregnancy", "After week 42", or with no due date the month: "October 2026". */
function heading(group: EntryGroup): string {
  if (group.place === "before") return "Before the pregnancy";
  if (group.place === "after") return "After week 42";
  if (group.place !== null) return weekLabel(group.place);
  return formatDate(`${group.month}-01` as ISODate, { month: "long", year: "numeric" });
}

/** A week's days, and whether it's this one: "This week · 27 Oct – 2 Nov". */
function aside(group: EntryGroup, dueDate: ISODate | null, now: Week | null): string | null {
  if (typeof group.place !== "number") return null;
  const dates = weekDates(group.place, dueDate);
  const range = dates ? `${formatDate(dates.start, { day: "numeric", month: "short" })} – ${formatDate(dates.end, { day: "numeric", month: "short" })}` : null;
  return [group.place === now ? "This week" : null, range].filter(Boolean).join(" · ") || null;
}
