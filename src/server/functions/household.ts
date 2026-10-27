import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { HouseholdRepo } from "../../db/models/household/repo";
import { type ISODate, isISODate } from "../../lib/dates";
import { BABY, type Baby } from "../../lib/theme";
import { getDb } from "../core/db";

const isoDate = z
  .string()
  .refine(isISODate, "a date as YYYY-MM-DD")
  .transform((d) => d as ISODate);

export const getHousehold = createServerFn({ method: "GET" }).handler(() => new HouseholdRepo(getDb()).get());

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
