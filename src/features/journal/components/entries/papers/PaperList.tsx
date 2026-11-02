import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { usePapersQuery } from "../../../../../api/rpc/papers";
import { useSettingsQuery } from "../../../../../api/rpc/settings";
import { ordered, type Paper } from "../../../../../lib/papers";
import { PaperRow } from "./PaperRow";
import { PaperViewer } from "./PaperViewer";

/** Papers as rows, each opened in place. */
export function PaperList({ papers, label }: { papers: Paper[]; label: string }) {
  const { data: settings } = useSettingsQuery();
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

/** Under a Library entry: the papers kept about it, if any. What it is, linked to what you kept. */
export function PapersAbout({ itemId }: { itemId: string }) {
  const { data: papers } = usePapersQuery();
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
  const { data: papers } = usePapersQuery();
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
          <Link to="/journal/records/$kind" params={{ kind: "papers" }} className="underline">
            keep it handy in the Journal
          </Link>{" "}
          and it's here, with no signal too.
        </p>
      )}
    </section>
  );
}
