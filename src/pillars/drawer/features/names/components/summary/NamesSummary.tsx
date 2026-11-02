import { useNamesQuery } from "../../../../../../api/rpc/names";
import { usePeopleQuery } from "../../../../../../api/rpc/people";
import { otherOf } from "../../../../../../lib/people";

/** The names game in a line, for its tile in the Drawer: the shortlist, or how a name gets on it. */
export function NamesSummary() {
  const { data: names } = useNamesQuery();
  const { me, people } = usePeopleQuery().data;
  const other = otherOf(people, me);
  const count = names.shortlist.length;
  return count > 0
    ? `On the shortlist: ${count === 1 ? names.shortlist[0]!.name : `${count} names`}. Keep swiping.`
    : `Swipe through names on your own phone. A name goes on the shortlist when ${other ? `you and ${other.name}` : "you both"} like it.`;
}
