import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { cleanProfile, isAnswer, question } from "../../content/profile";
import { HouseholdRepo } from "../../db/models/household/repo";
import { type ISODate, isISODate } from "../../lib/dates";
import { BABY, type Baby } from "../../lib/theme";
import { getDb } from "../core/db";

const isoDate = z
  .string()
  .refine(isISODate, "a date as YYYY-MM-DD")
  .transform((d) => d as ISODate);

export const getHousehold = createServerFn({ method: "GET" }).handler(() => {
  const household = new HouseholdRepo(getDb()).get();
  return { ...household, profile: cleanProfile(household.profile) };
});

/** Answer one of content/profile.yaml's questions, or clear the answer with null. */
export const saveAnswer = createServerFn({ method: "POST" })
  .validator(
    z
      .object({ question: z.string(), answer: z.string().nullable() })
      .strict()
      .refine((a) => question(a.question) !== undefined, "not a question in profile.yaml")
      .refine((a) => a.answer === null || isAnswer(a.question, a.answer), "not an answer to that question")
  )
  .handler(({ data }) => new HouseholdRepo(getDb()).answer(data.question, data.answer));

export const saveHousehold = createServerFn({ method: "POST" })
  .validator(
    z
      .object({
        dueDate: isoDate.nullable().optional(),
        birthDate: isoDate.nullable().optional(),
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
