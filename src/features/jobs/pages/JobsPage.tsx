import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useExtrasQuery } from "../../../api/rpc/extras";
import { useJobsQuery } from "../../../api/rpc/jobs";
import { usePeopleQuery } from "../../../api/rpc/people";
import { useQuietQuery } from "../../../api/rpc/quiet";
import { extrasOn } from "../../../lib/extras";
import { JOBS, outcomes, toAnswer, waiting } from "../../../lib/jobs";
import { extra } from "../../settings/model/extras";
import { JobDeck } from "../components/deck/JobDeck";
import { Results } from "../components/results/Results";

/**
 * Who does what: the jobs you haven't answered, one at a time, then those
 * you've both answered, to talk about first, then settled. Neither sees the
 * other's answer until both have given one. With its extra off, it says so;
 * while something has happened, it's put away.
 */
export function JobsPage() {
  const { data: view } = useJobsQuery();
  const { me, people } = usePeopleQuery().data;
  const { data: on } = useExtrasQuery({ select: (e) => extrasOn(e).has("who-does-what") });
  const { data: quiet } = useQuietQuery();
  const other = people.find((p) => p.id !== me?.id)?.name ?? "The other one";
  const deck = toAnswer(view.answers);
  const results = outcomes(view.answers);
  const waits = waiting(view.answers);
  const tool = extra("who-does-what");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 md:px-8">
      <Link to="/drawer" className="mt-4 flex min-h-11 items-center gap-1 text-sm text-fg-subtle">
        <ChevronLeft aria-hidden size={16} /> The Drawer
      </Link>
      <h1 className="mb-2 font-display text-3xl font-semibold text-fg-strong">Who does what</h1>
      {quiet ? (
        <p className="text-sm text-fg-subtle">Who does what is put away while Expecting is quiet. Nothing is deleted.</p>
      ) : !on ? (
        <p className="text-sm text-fg-normal">
          This comes with {tool.name}.{" "}
          <Link to="/settings" search={{ ask: `extra:${tool.id}` }} className="underline">
            Turn it on in settings
          </Link>
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          <p className="text-fg-subtle">Say who'll do each newborn job, on your own phone. You'll see {other}'s answer to a job once you've both given one.</p>
          <JobDeck deck={deck} other={other} />
          <p className="text-sm text-fg-normal">
            {view.together
              ? `${other} has answered ${view.theirCount} of ${JOBS.length}.`
              : "Once the other of you has said who they are, they can answer too."}
            {waits > 0 && view.together ? ` ${waits === 1 ? "One of your answers waits" : `${waits} of your answers wait`} for theirs.` : ""}
          </p>
          <Results outcomes={results} other={other} />
        </div>
      )}
    </main>
  );
}
