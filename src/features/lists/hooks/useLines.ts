import { useMemo } from "react";
import { useAnswersQuery } from "../../../api/rpc/facts";
import { useListsQuery } from "../../../api/rpc/lists";
import type { Line } from "../../../content/schema";
import { factsOf } from "../../../lib/facts";
import { tailorLines } from "../../../lib/lists";
import { useItems } from "../../library/hooks/useItems";

/** The lines for you: those of the items shown whose own when fits, then your own, as your answers, extras and lines change. */
export function useLines(): Line[] {
  const items = useItems();
  const { data: facts } = useAnswersQuery({ select: factsOf });
  const { data: lists } = useListsQuery();
  return useMemo(() => tailorLines(items, facts, lists.ownLines), [items, facts, lists.ownLines]);
}
