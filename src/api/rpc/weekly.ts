// A question a week. Every call is as the person holding this phone: the
// server returns their own answers, and the other's only for a week both have
// answered.

import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { WeeklyRepo } from "../../db/models/weekly/repo";
import { questionOf, type WeeklyView } from "../../lib/home/weekly";
import { save, stamped } from "../../lib/outbox";
import { getDb } from "../../server/core/db";
import { madeAt } from "../../server/core/madeAt";
import { personId } from "../../server/core/person";
import { queryHook } from "../queryHook";

const getWeekly = createServerFn({ method: "GET" }).handler(() => new WeeklyRepo(getDb()).view(personId()));

const answerWeekly = createServerFn({ method: "POST" })
  .validator(
    z
      .object({
        week: z
          .number()
          .int()
          .refine((w) => questionOf(w) !== undefined, "a week with a question in src/lib/home/weekly.ts"),
        body: z.string().max(4000),
      })
      .strict()
  )
  .handler(({ data }) => {
    new WeeklyRepo(getDb()).answer(data.week, personId(), data.body, madeAt());
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

export const useWeeklyQuery = queryHook(weeklyQuery);
