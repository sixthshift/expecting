import { useMemo } from "react";
import { useAnswersQuery } from "../../../../../api/rpc/facts";
import { useListsQuery } from "../../../../../api/rpc/lists";
import type { Line } from "../../../../../content/schema";
import { factsOf } from "../../../../../lib/facts";
import { tailorLines } from "../../../../../lib/planner/lists/lines";
import { type ListSummary, listsOf } from "../../../../../lib/planner/lists/summaries";
import { useItems } from "../../../../library/hooks/useItems";

/** The lines for you: those of the items shown whose own when fits, then your own, as your answers, extras and lines change. */
export function useLines(): Line[] {
  const items = useItems();
  const { data: facts } = useAnswersQuery({ select: factsOf });
  const { data: lists } = useListsQuery();
  return useMemo(() => tailorLines(items, facts, lists.ownLines), [items, facts, lists.ownLines]);
}

/** Every list summed up (`listsOf`): built in and your own, each with where it's up to, as its lines and marks change. */
export function useListSummaries(): ListSummary[] {
  const lines = useLines();
  const { data: lists } = useListsQuery();
  return useMemo(() => listsOf(lines, lists.ownLists, lists.marks), [lines, lists]);
}
