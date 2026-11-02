import { useJobsQuery } from "../../../../api/rpc/jobs";
import { results } from "../../../../lib/jobs";

/** Who does what in a line, for its tile in the Drawer: how many are settled, and how many to talk about. */
export function JobsSummary() {
  const { data: answered } = useJobsQuery({ select: (view) => results(view.answers) });
  const { toTalk, settled } = answered;
  return settled.length + toTalk.length === 0
    ? "Say who'll do each newborn job, on your own phone, then see where you agree."
    : `${settled.length} settled${toTalk.length > 0 ? `, ${toTalk.length} to talk about` : ""}.`;
}
