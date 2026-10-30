// Results and papers in the Journal: a new one, then every one, handy first,
// found by kind or by words. And the same rows where they're wanted: the
// handy ones on Emergency info, and those about a Library entry under it.
// Expecting keeps them and finds them; it never reads them. See
// docs/plan-results-papers.md.

import { Button } from "@sixthshift/design-system/button";
import { SearchInput } from "@sixthshift/design-system/search-input";
import { ToggleGroup } from "@sixthshift/design-system/toggle-group";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { usePapers } from "../../../../api/rpc/papers";
import { useSettings } from "../../../../api/rpc/settings";
import { kindsKept, ordered, PAPER_KIND_PLURAL, type Paper, type PaperKind, paperMatches } from "../../../../lib/papers";
import type { QuietKind } from "../../../../lib/quiet";
import { PaperRow } from "./PaperRow";
import { PaperViewer } from "./PaperViewer";

/** How many are shown before "Show all". */
const SHOWN = 8;

/** From how many papers there's a search. */
const SEARCH_FROM = 5;

/** Papers as rows, each opened in place. */
function PaperList({ papers, label }: { papers: Paper[]; label: string }) {
  const { data: settings } = useSettings();
  const [open, setOpen] = useState<string | null>(null);
  return (
    <>
      <ul aria-label={label} className="flex flex-col">
        {papers.map((paper) => (
          <li key={paper.id}>
            <PaperRow paper={paper} dueDate={settings.dueDate} onOpen={() => setOpen(paper.id)} />
          </li>
        ))}
      </ul>
      {open ? <PaperViewer id={open} onClose={() => setOpen(null)} /> : null}
    </>
  );
}

/**
 * The Journal's Papers lens: every one, handy first and then newest by the
 * date on it, with the kinds there are to filter by and a search from five.
 * New ones come in through the "+". Stays as it is while something has
 * happened: papers are admin, and there are more after a loss, not fewer (the
 * form suggests nothing pregnancy-forward then).
 */
export function PapersLens({ quiet }: { quiet: QuietKind | null }) {
  const { data: papers } = usePapers();
  const [words, setWords] = useState("");
  const [kind, setKind] = useState<PaperKind | "all">("all");
  const [all, setAll] = useState(false);
  const kinds = kindsKept(papers);
  const showing = kind !== "all" && kinds.includes(kind) ? kind : "all";
  const found = ordered(papers).filter((p) => (showing === "all" || p.kind === showing) && paperMatches(p, words));
  const shown = all ? found : found.slice(0, SHOWN);

  return (
    <section aria-labelledby="papers" className="flex max-w-3xl flex-col gap-4">
      <h2 id="papers" className="text-lg font-display font-semibold text-fg-strong">
        Results and papers
      </h2>
      <p className="text-sm text-fg-subtle">
        {quiet === "loss"
          ? "Results, letters, the papers from the hospital: photographed or saved as a PDF, kept for you both."
          : "Results, letters, the birth plan, the discharge summary: photographed or saved as a PDF, kept for you both and found in a moment. Expecting keeps them; it doesn't read them."}
      </p>
      {papers.length >= SEARCH_FROM ? (
        // Words held on the page, not in the address.
        <SearchInput value={words} onValueChange={setWords} placeholder="Look through your papers" aria-label="Search your papers" />
      ) : null}
      {kinds.length > 1 ? (
        <ToggleGroup
          type="single"
          appearance="separate"
          variant="outline"
          size="sm"
          aria-label="Show"
          className="flex-wrap"
          value={showing}
          onValueChange={(value) => setKind((value || "all") as PaperKind | "all")}
          options={[{ value: "all", label: "All" }, ...kinds.map((k) => ({ value: k, label: PAPER_KIND_PLURAL[k] }))]}
        />
      ) : null}
      {papers.length > 0 && found.length === 0 ? <p className="text-fg-subtle">No paper has those words.</p> : null}
      {shown.length > 0 ? <PaperList papers={shown} label="Your papers" /> : null}
      {found.length > shown.length ? (
        <Button variant="ghost" size="sm" className="self-start" onClick={() => setAll(true)}>
          Show all {found.length}
        </Button>
      ) : null}
    </section>
  );
}

/** Under a Library entry: the papers kept about it, if any. What it is, linked to what you kept. */
export function PapersAbout({ itemId }: { itemId: string }) {
  const { data: papers } = usePapers();
  const about = ordered(papers.filter((p) => p.itemId === itemId));
  if (about.length === 0) return null;
  return (
    <section aria-labelledby="your-papers" className="flex flex-col gap-1">
      <h2 id="your-papers" className="text-sm font-semibold text-fg-strong">
        Your papers
      </h2>
      <PaperList papers={about} label="Your papers about this" />
    </section>
  );
}

/**
 * On Emergency info: the papers kept handy, opened in place, there with no
 * signal too (each phone keeps their pages). With none, how to put one there.
 */
export function PapersToHand() {
  const { data: papers } = usePapers();
  const handy = ordered(papers.filter((p) => p.handy));
  return (
    <section aria-labelledby="emergency-papers" className="flex flex-col gap-3">
      <h2 id="emergency-papers" className="text-sm font-semibold tracking-wide text-fg-subtle uppercase">
        Papers to hand
      </h2>
      {handy.length > 0 ? (
        <div className="rounded-xl border border-border-subtle bg-bg-normal p-1">
          <PaperList papers={handy} label="Papers kept handy" />
        </div>
      ) : (
        <p className="text-sm text-fg-subtle">
          The birth plan, or a result you'll be asked for:{" "}
          <Link to="/journal" className="underline">
            keep it handy in the Journal
          </Link>{" "}
          and it's here, with no signal too.
        </p>
      )}
    </section>
  );
}
