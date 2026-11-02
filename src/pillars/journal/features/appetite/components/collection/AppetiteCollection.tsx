import { Button } from "@sixthshift/design-system/button";
import { useState } from "react";
import { useAppetiteQuery } from "../../../../../../api/rpc/appetite";
import { latestFirst } from "../../../../../../lib/journal/appetite";
import { AppetiteItem } from "../AppetiteItem";
import { Cravings } from "./cravings/Cravings";
import { SicknessWeeks } from "./sickness/SicknessWeeks";

/** How many entries are listed before "Show all". */
const LISTED = 8;

/**
 * The Journal's Sickness & cravings record at full size: sickness since when as weeks of
 * days, what's been craved and gone off, then each entry. New ones come in
 * through the "+"; the record is there only once one is kept, and never while
 * something has happened (the Journal folds them away then).
 */
export function AppetiteCollection() {
  const { data: entries } = useAppetiteQuery();
  const [all, setAll] = useState(false);
  const listed = latestFirst(entries);
  const shown = all ? listed : listed.slice(0, LISTED);

  return (
    <section aria-labelledby="appetite" className="flex flex-col gap-4">
      <h2 id="appetite" className="text-lg font-display font-semibold text-fg-strong">
        Sickness and cravings
      </h2>
      <p className="text-sm text-fg-subtle">When it comes and what you crave, so you can answer “since when?”, and laugh about it later.</p>
      <SicknessWeeks />
      <Cravings />
      {shown.map((entry) => (
        <AppetiteItem key={entry.id} entry={entry} />
      ))}
      {listed.length > shown.length ? (
        <Button variant="ghost" size="sm" className="self-start" onClick={() => setAll(true)}>
          Show all {listed.length}
        </Button>
      ) : null}
    </section>
  );
}
