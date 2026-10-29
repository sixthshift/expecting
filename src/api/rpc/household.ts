import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { extra } from "../../content/extras";
import { ask } from "../../content/facts";
import { ChecklistRepo } from "../../db/models/checklist/repo";
import { ExtrasRepo } from "../../db/models/extras/repo";
import { FactsRepo } from "../../db/models/facts/repo";
import { HouseholdRepo } from "../../db/models/household/repo";
import { PeopleRepo } from "../../db/models/people/repo";
import { type ISODate, isISODate } from "../../lib/dates";
import { BABY, type Baby } from "../../lib/theme";
import { getDb } from "../../server/core/db";
import { personId } from "../../server/core/person";

const isoDate = z
  .string()
  .refine(isISODate, "a date as YYYY-MM-DD")
  .transform((d) => d as ISODate);

/**
 * Everything the household has said, in one read: its dates and colours, its
 * answers, its extras, the checklist's ticks and own tasks, and its people,
 * with who's holding this phone. Answers and extras no longer in the content
 * are left out.
 */
export const getHouseholdState = createServerFn({ method: "GET" }).handler(() => {
  const db = getDb();
  const checklist = new ChecklistRepo(db);
  const people = new PeopleRepo(db);
  const id = personId();
  return {
    household: new HouseholdRepo(db).get(),
    answers: new FactsRepo(db).latest().filter((a) => ask(a.about === "household" ? a.question : `${a.question}.${a.about}`) !== undefined),
    extras: new ExtrasRepo(db).list().filter((c) => extra(c.id) !== undefined),
    ticks: checklist.ticks(),
    ownTasks: checklist.ownTasks(),
    me: id ? people.get(id) : null,
    people: people.list(),
  };
});

export const saveHousehold = createServerFn({ method: "POST" })
  .validator(
    z
      .object({
        dueDate: isoDate.nullable().optional(),
        baby: z.enum(Object.keys(BABY) as [Baby, ...Baby[]]).optional(),
      })
      .strict()
  )
  .handler(({ data }) => new HouseholdRepo(getDb()).update(data));

/** Onboarding is done: from now on, a new device is only asked who it is. */
export const finishOnboarding = createServerFn({ method: "POST" }).handler(() => {
  const repo = new HouseholdRepo(getDb());
  return repo.update({ onboardedAt: repo.get().onboardedAt ?? new Date().toISOString() });
});
