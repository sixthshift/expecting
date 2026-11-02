// A question a week. Every call is as the person holding this phone: the
// server returns their own answers, and the other's only for a week both have
// answered. A phone that hasn't said who's holding it sees only those weeks.

import { queryOptions, type UseSuspenseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PeopleRepo } from "../../db/models/people/repo";
import { WeeklyRepo } from "../../db/models/weekly/repo";
import { save, stamped } from "../../lib/outbox";
import { questionOf, type WeeklyView } from "../../lib/weekly";
import { getDb } from "../../server/core/db";
import { madeAt } from "../../server/core/madeAt";
import { personId } from "../../server/core/person";

/** The person this phone says it is, if they're still here. */
function holder(): string | null {
  const id = personId();
  return id && new PeopleRepo(getDb()).get(id) ? id : null;
}

export const getWeekly = createServerFn({ method: "GET" }).handler(() => new WeeklyRepo(getDb()).view(holder()));

export const answerWeekly = createServerFn({ method: "POST" })
  .validator(
    z
      .object({
        week: z
          .number()
          .int()
          .refine((w) => questionOf(w) !== undefined, "a week with a question in src/lib/weekly.ts"),
        body: z.string().max(4000),
      })
      .strict()
  )
  .handler(({ data }) => {
    const me = holder();
    if (!me) throw new Error("Say who's holding this phone first");
    new WeeklyRepo(getDb()).answer(data.week, me, data.body, madeAt());
  });

export type { WeeklyView };
export const weeklyQuery = queryOptions({ queryKey: ["weekly"], queryFn: () => getWeekly() });

/** A question a week's save, through the outbox (src/app/model/outbox.ts): your answer shows at once; the other's comes with the next fetch. */
export const weeklySaves = {
  answerWeekly: save({
    key: "answerWeekly",
    query: weeklyQuery.queryKey,
    send: (data: { week: number; body: string }, made) => answerWeekly({ data, headers: stamped(made) }),
    apply: (view: WeeklyView, { week, body }, made) => {
      const words = body.trim();
      const rest = view.weeks.filter((w) => w.week !== week);
      const now = view.weeks.find((w) => w.week === week);
      if (!words) return { weeks: rest };
      const mine = { body: words, by: made.by ?? "", answeredAt: now?.mine?.answeredAt ?? made.at };
      return { weeks: [...rest, { week: week as WeeklyView["weeks"][number]["week"], mine, theirs: now?.theirs ?? null }].sort((a, b) => a.week - b.week) };
    },
  }),
};

/** weeklyQuery as useSuspenseQuery returns it; `options` (`select`, …) override its defaults. It has no select of its own, so the data is TData. */
export function useWeeklyQuery<TData = WeeklyView>(options?: Omit<UseSuspenseQueryOptions<WeeklyView, Error, TData, string[]>, "queryKey" | "queryFn">) {
  return useSuspenseQuery({ ...weeklyQuery, ...options } as UseSuspenseQueryOptions<WeeklyView, Error, TData, string[]>);
}
