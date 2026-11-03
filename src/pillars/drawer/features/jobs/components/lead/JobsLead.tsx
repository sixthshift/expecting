import { usePeopleQuery } from "../../../../../../api/rpc/people";
import { otherName } from "../../../../../../lib/people";

/** What Who does what is, under its name: on its page, and on the page put away while something has happened. */
export function JobsLead() {
  const { me, people } = usePeopleQuery().data;
  return `Say who'll do each newborn job, on your own phone. You'll see ${otherName(people, me)}'s answer to a job once you've both given one.`;
}
