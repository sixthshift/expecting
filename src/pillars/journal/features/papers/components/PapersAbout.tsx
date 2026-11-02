import { usePapersQuery } from "../../../../../api/rpc/papers";
import { ordered } from "../../../../../lib/journal/papers";
import { PaperList } from "./PaperList";

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
