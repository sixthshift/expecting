import { useListsQuery } from "../../../../../api/rpc/lists";
import { usePeopleQuery } from "../../../../../api/rpc/people";
import type { Line } from "../../../../../content/schema";
import { nameBy } from "../../../../../lib/people";
import { useListPage } from "../../../contexts/ListPageContext";
import { LineRow } from "./LineRow";

/** One line on the list's page: its mark, who set it, its task's when; got, it keeps its place until the next visit. */
export function ListLine({ line }: { line: Line }) {
  const { taskOf, stay } = useListPage();
  const { data: mark } = useListsQuery({ select: (l) => l.marks[line.id] });
  const { data: people } = usePeopleQuery();
  return (
    <LineRow
      line={line}
      mark={mark}
      by={nameBy(mark?.by ?? null, people.me, people.people, "you")}
      task={taskOf(line)}
      onTick={(got) => got && stay(line.id)}
    />
  );
}
