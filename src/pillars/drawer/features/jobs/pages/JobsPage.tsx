import { useJobsQuery } from "../../../../../api/rpc/jobs";
import { usePeopleQuery } from "../../../../../api/rpc/people";
import { JOBS, results, toAnswer, waiting } from "../../../../../lib/drawer/jobs";
import { otherName } from "../../../../../lib/people";
import { DrawerTool } from "../../../components/tool/DrawerTool";
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
  const other = otherName(people, me);
  const deck = toAnswer(view.answers);
  const answered = results(view.answers);
  const waits = waiting(view.answers);

  return (
    <DrawerTool title="Who does what" putAway={{ subject: "Who does what" }} extras={["who-does-what"]}>
      <div className="flex flex-col gap-6">
        <p className="text-fg-subtle">Say who'll do each newborn job, on your own phone. You'll see {other}'s answer to a job once you've both given one.</p>
        <JobDeck deck={deck} other={other} />
        <p className="text-sm text-fg-normal">
          {view.together ? `${other} has answered ${view.theirCount} of ${JOBS.length}.` : "Once the other of you has said who they are, they can answer too."}
          {waits > 0 && view.together ? ` ${waits === 1 ? "One of your answers waits" : `${waits} of your answers wait`} for theirs.` : ""}
        </p>
        <Results results={answered} other={other} />
      </div>
    </DrawerTool>
  );
}
