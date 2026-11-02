import { createContext, type ReactNode, use, useCallback, useMemo, useState } from "react";
import { useChecklistQuery } from "../../../../../api/rpc/checklist";
import { useListsQuery } from "../../../../../api/rpc/lists";
import { useNow } from "../../../../../api/rpc/settings";
import type { Line } from "../../../../../content/schema";
import { type ListSummary, listsOf } from "../../../../../lib/lists/summaries";
import { lineTaskWhen } from "../../../model/labels";
import { useTasks } from "../../tasks/hooks/useTasks";
import type { LineTask } from "../components/line/LineRow";
import { useLines } from "../hooks/useLines";

/** How close a task's best-by week is before its badge turns to a warning. */
const SOON = 2;

/**
 * One list's context: what its page works out once, and what its heading,
 * sections and lines must agree on. What only one part needs, that part
 * works out (the sections, a line's mark and who set it).
 */
export type ListPage = {
  /** The list's id, from its address. */
  listId: string;
  /** Where it's up to, or undefined when it isn't here (deleted, or nothing on it for you). */
  summary: ListSummary | undefined;
  /** One of your own, which can be renamed and deleted; null for a built-in one. */
  own: { id: string; title: string } | null;
  /** "Just what's left": the got hidden, for the shop. */
  leftOnly: boolean;
  setLeftOnly: (on: boolean) => void;
  /** Got during this visit: they keep their place until the next one. */
  tickedHere: ReadonlySet<string>;
  /** Keep a line just got where it is, until the next visit. */
  stay: (lineId: string) => void;
  /** What a line's task says under it, or null for a line with none. */
  taskOf: (line: Line) => LineTask | null;
};

const PageContext = createContext<ListPage | null>(null);

/**
 * One list's context: the list summed up, whether it's yours, "just what's
 * left", what's got during this visit, and its lines' tasks, worked out once.
 * It holds no data of its own: the queries stay in the query cache.
 */
export function ListPageProvider({ listId, children }: { listId: string; children: ReactNode }) {
  const lines = useLines();
  const { data: lists } = useListsQuery();
  const { data: ticks } = useChecklistQuery({ select: (c) => c.ticks });
  const tasks = useTasks();
  const now = useNow();
  const [tickedHere, setTickedHere] = useState<ReadonlySet<string>>(new Set());
  const [leftOnly, setLeftOnly] = useState(false);
  const stay = useCallback((lineId: string) => setTickedHere((ids) => new Set(ids).add(lineId)), []);
  const summary = useMemo(() => listsOf(lines, lists.ownLists, lists.marks).find((l) => l.id === listId), [lines, lists, listId]);
  const ownList = lists.ownLists.find((l) => l.id === listId);
  const ownId = ownList?.id;
  const ownTitle = ownList?.title;
  const own = useMemo(() => (ownId !== undefined && ownTitle !== undefined ? { id: ownId, title: ownTitle } : null), [ownId, ownTitle]);
  const taskOf = useCallback(
    (line: Line): LineTask | null => {
      const task = line.taskId ? tasks.find((t) => t.id === line.taskId) : undefined;
      if (!task) return null;
      if (ticks[task.id]) return { label: "done in To do", soon: false, done: true };
      return { label: lineTaskWhen(task), soon: now !== null && task.due - now <= SOON, done: false };
    },
    [tasks, ticks, now]
  );

  const page = useMemo(
    () => ({ listId, summary, own, leftOnly, setLeftOnly, tickedHere, stay, taskOf }),
    [listId, summary, own, leftOnly, tickedHere, stay, taskOf]
  );

  return <PageContext value={page}>{children}</PageContext>;
}

/** What one list's page draws, inside `ListPageProvider`. */
export function useListPage(): ListPage {
  const page = use(PageContext);
  if (!page) throw new Error("useListPage must be called inside ListPageProvider");
  return page;
}
