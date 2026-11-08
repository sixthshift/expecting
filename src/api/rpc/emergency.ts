// Emergency info: the page to open when something goes wrong. Shared by both of you, so any
// phone can read and change it; a change says who made it, if the phone has said.

import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { EmergencyRepo } from "../../db/models/emergency/repo";
import { EMERGENCY_IDS, EMERGENCY_MAX, tidyValue } from "../../lib/emergency";
import { save, stamped } from "../../lib/outbox";
import { getDb } from "../../server/core/db";
import { madeAt } from "../../server/core/madeAt";
import { personId } from "../../server/core/person";
import { queryHook } from "../queryHook";

const getEmergency = createServerFn({ method: "GET" }).handler(() => new EmergencyRepo(getDb()).get());

const value = z.string().transform(tidyValue).pipe(z.string().max(EMERGENCY_MAX));

const saveEmergency = createServerFn({ method: "POST" })
  .validator(z.partialRecord(z.enum(EMERGENCY_IDS), value))
  .handler(({ data }) => {
    new EmergencyRepo(getDb()).set(data as Record<string, string>, personId(), madeAt());
  });

/** Emergency info: your numbers and details. */
export type Emergency = Awaited<ReturnType<typeof getEmergency>>;
export const emergencyQuery = queryOptions({ queryKey: ["emergency"], queryFn: () => getEmergency() });

/** Emergency info's save, through the outbox (src/app/model/outbox.ts): it shows at once, and is sent when it can be. */
export const emergencySaves = {
  saveEmergency: save({
    key: "saveEmergency",
    query: emergencyQuery.queryKey,
    send: (data: Record<string, string>, made) => saveEmergency({ data, headers: stamped(made) }),
    apply: (emergency: Emergency, typed, made) => {
      const values = { ...emergency.values };
      let changed = false;
      for (const [field, raw] of Object.entries(typed)) {
        const value = tidyValue(raw);
        if ((values[field] ?? "") === value) continue;
        changed = true;
        if (value === "") delete values[field];
        else values[field] = value;
      }
      return changed ? { values, changed: { by: made.by, at: made.at } } : emergency;
    },
  }),
};

export const useEmergencyQuery = queryHook(emergencyQuery);
