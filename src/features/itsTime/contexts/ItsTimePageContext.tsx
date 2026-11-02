import { createContext, type ReactNode, use, useMemo } from "react";
import { useAnswersQuery } from "../../../api/rpc/facts";
import { useItsTimeQuery } from "../../../api/rpc/itsTime";
import { usePeopleQuery } from "../../../api/rpc/people";
import { factsOf } from "../../../lib/facts";
import { openStart, type Start } from "../../../lib/itsTime";
import type { Person } from "../../../lib/people";
import { atHome } from "../model/ready";

/**
 * It's time's context: what its parts must agree on, worked out once. The
 * queries (Emergency info, the answers, the bag, the ticks) stay in the query
 * cache: each part reads what it needs through their hooks.
 */
export type ItsTimePage = {
  /** The start under way, or null: the practice run, the night's page greyed. */
  start: Start | null;
  /** A home birth: the midwife comes to you, and there's no trip. */
  home: boolean;
  /** Who's holding this phone. */
  me: Person | null;
  /** The partner, and the one carrying, each null until they've joined. */
  partner: Person | null;
  carrying: Person | null;
};

const PageContext = createContext<ItsTimePage | null>(null);

/** It's time's context: the start, whether it's a home birth, and who's who, for every part of the page. */
export function ItsTimePageProvider({ children }: { children: ReactNode }) {
  const { data: start } = useItsTimeQuery({ select: openStart });
  const { data: home } = useAnswersQuery({ select: (a) => atHome(factsOf(a)) });
  const { data: people } = usePeopleQuery();
  const page = useMemo(
    () => ({
      start,
      home,
      me: people.me,
      partner: people.people.find((p) => p.role === "partner") ?? null,
      carrying: people.people.find((p) => p.role === "carrying") ?? null,
    }),
    [start, home, people]
  );
  return <PageContext value={page}>{children}</PageContext>;
}

/** What It's time's parts share, inside `ItsTimePageProvider`. */
export function useItsTimePage(): ItsTimePage {
  const page = use(PageContext);
  if (!page) throw new Error("useItsTimePage must be called inside ItsTimePageProvider");
  return page;
}
