import { useBingoQuery } from "../../../../api/rpc/bingo";
import { usePeopleQuery } from "../../../../api/rpc/people";
import { standing, standingLine } from "../../../../lib/bingo";
import { otherOf } from "../../../../lib/people";

/** Bingo in a line, for its tile in the Drawer: where each card is up to, or what the game is. */
export function BingoSummary() {
  const { data: bingo } = useBingoQuery();
  const { me, people } = usePeopleQuery().data;
  const other = otherOf(people, me);
  const mine = bingo.cards.find((c) => c.personId === me?.id) ?? null;
  const theirs = other ? (bingo.cards.find((c) => c.personId === other.id) ?? null) : null;
  return mine || theirs
    ? [mine ? `You: ${standingLine(standing(mine))}` : null, theirs && other ? `${other.name}: ${standingLine(standing(theirs))}` : null]
        .filter(Boolean)
        .join(" · ")
    : "A card each of the things people say and do. First to a line wins.";
}
