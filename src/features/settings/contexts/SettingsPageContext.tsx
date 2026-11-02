import { getRouteApi } from "@tanstack/react-router";
import { createContext, type ReactNode, use, useEffect, useMemo, useState } from "react";
import { useAnswersQuery } from "../../../api/rpc/facts";
import { useSettingsQuery } from "../../../api/rpc/settings";
import { type Answer, asksFor, factsOf, isSettled, latestByKey } from "../../../lib/facts";
import type { Ask } from "../model/facts";

const route = getRouteApi("/app/settings");

/** The due date's row: a setting, not a question, but answered and counted as one. */
export const DUE_DATE = "dueDate";

/**
 * Settings' context: what several of its parts agree on, worked out once.
 * What only one part needs, that part works out (a row's answer in words,
 * when it's asked again, what it decides).
 */
export type SettingsPage = {
  /** The row open, by its key (a question's, `dueDate`), or null: one at a time. */
  open: string | null;
  /** Open a row, or close it if it's the one open. */
  toggle: (key: string) => void;
  /** Close whichever row is open. */
  close: () => void;
  /** Open a row and scroll to it. */
  goTo: (key: string) => void;
  /** The extra a link opened Settings at (`?ask=extra:babymoon`), to mark. */
  highlight: string | undefined;
  /** Every question asked, as things stand: one asked of each of you, once each. */
  asks: Ask[];
  /** Each question's latest answer, by key. */
  latest: Record<string, Answer>;
  /** How many there are to answer, the due date among them, and how many are. */
  total: number;
  answered: number;
  /** The next row to answer, or undefined with every one settled. */
  next: string | undefined;
  /** How many are still to answer in a group. */
  waiting: (group: string) => number;
};

const PageContext = createContext<SettingsPage | null>(null);

/**
 * Settings' context: the row open, and the questions as things stand. It
 * holds no data of its own: the queries stay in the query cache, read
 * through their hooks. `?ask=cover` opens at a question, wherever it sits
 * on the page.
 */
export function SettingsPageProvider({ children }: { children: ReactNode }) {
  const { ask } = route.useSearch();
  const { data: dueDate } = useSettingsQuery({ select: (s) => s.dueDate });
  const { data: answers } = useAnswersQuery();

  const [open, setOpen] = useState<string | null>(ask ?? null);
  // A link to a question opens it, wherever it sits on the page.
  useEffect(() => {
    if (!ask) return;
    setOpen(ask);
    requestAnimationFrame(() => document.getElementById(`setting-${ask}`)?.scrollIntoView({ block: "start" }));
  }, [ask]);

  const page = useMemo((): SettingsPage => {
    const asks = asksFor(factsOf(answers));
    const latest = latestByKey(answers);
    const unsettled = asks.filter((a) => !isSettled(a, latest[a.key]));
    const total = asks.length + 1;
    return {
      open,
      toggle: (key) => setOpen((o) => (o === key ? null : key)),
      close: () => setOpen(null),
      goTo: (key) => {
        setOpen(key);
        requestAnimationFrame(() => document.getElementById(`setting-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
      },
      highlight: ask?.startsWith("extra:") ? ask.slice("extra:".length) : undefined,
      asks,
      latest,
      total,
      answered: total - unsettled.length - (dueDate ? 0 : 1),
      next: dueDate ? unsettled[0]?.key : DUE_DATE,
      waiting: (group) => unsettled.filter((a) => a.question.group === group).length + (group === "pregnancy" && !dueDate ? 1 : 0),
    };
  }, [answers, dueDate, open, ask]);

  return <PageContext value={page}>{children}</PageContext>;
}

/** What Settings' parts share, inside `SettingsPageProvider`. */
export function useSettingsPage(): SettingsPage {
  const page = use(PageContext);
  if (!page) throw new Error("useSettingsPage must be called inside SettingsPageProvider");
  return page;
}
