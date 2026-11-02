import { Link } from "@tanstack/react-router";
import { usePapersQuery } from "../../../../../api/rpc/papers";
import { ordered } from "../../../../../lib/journal/papers";
import { PaperList } from "./PaperList";

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
          <Link to="/journal/collections/$name" params={{ name: "papers" }} className="underline">
            keep it handy in the Journal
          </Link>{" "}
          and it's here, with no signal too.
        </p>
      )}
    </section>
  );
}
