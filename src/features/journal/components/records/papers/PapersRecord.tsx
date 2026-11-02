import { Button } from "@sixthshift/design-system/button";
import { SearchInput } from "@sixthshift/design-system/search-input";
import { ToggleGroup } from "@sixthshift/design-system/toggle-group";
import { useState } from "react";
import { usePapersQuery } from "../../../../../api/rpc/papers";
import { kindsKept, ordered, PAPER_KIND_PLURAL, type PaperKind, paperMatches } from "../../../../../lib/papers";
import type { QuietKind } from "../../../../../lib/quiet";
import { PaperList } from "../../entries/papers/PaperList";

/** How many are shown before "Show all". */
const SHOWN = 8;

/** From how many papers there's a search. */
const SEARCH_FROM = 5;

/**
 * The Journal's Papers lens: every one, handy first and then newest by the
 * date on it, with the kinds there are to filter by and a search from five.
 * New ones come in through the "+". Stays as it is while something has
 * happened: papers are admin, and there are more after a loss, not fewer (the
 * form suggests nothing pregnancy-forward then).
 */
export function PapersRecord({ quiet }: { quiet: QuietKind | null }) {
  const { data: papers } = usePapersQuery();
  const [words, setWords] = useState("");
  const [kind, setKind] = useState<PaperKind | "all">("all");
  const [all, setAll] = useState(false);
  const kinds = kindsKept(papers);
  const showing = kind !== "all" && kinds.includes(kind) ? kind : "all";
  const found = ordered(papers).filter((p) => (showing === "all" || p.kind === showing) && paperMatches(p, words));
  const shown = all ? found : found.slice(0, SHOWN);

  return (
    <section aria-labelledby="papers" className="flex flex-col gap-4">
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
