// Emergency info: the page to open when something goes wrong. Shared by both of you, so any
// phone can read and change it; a change says who made it, if the phone has said.

import { queryOptions, type UseSuspenseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { EmergencyRepo } from "../../db/models/emergency/repo";
import { PeopleRepo } from "../../db/models/people/repo";
import { EMERGENCY_IDS, EMERGENCY_MAX, tidyValue } from "../../lib/emergency";
import { save, stamped } from "../../lib/outbox";
import { getDb } from "../../server/core/db";
import { madeAt } from "../../server/core/madeAt";
import { personId } from "../../server/core/person";

export const getEmergency = createServerFn({ method: "GET" }).handler(() => new EmergencyRepo(getDb()).get());

const value = z.string().transform(tidyValue).pipe(z.string().max(EMERGENCY_MAX));

export const saveEmergency = createServerFn({ method: "POST" })
  .validator(z.partialRecord(z.enum(EMERGENCY_IDS), value))
  .handler(({ data }) => {
    const id = personId();
    const by = id && new PeopleRepo(getDb()).get(id) ? id : null;
    new EmergencyRepo(getDb()).set(data as Record<string, string>, by, madeAt());
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

/** emergencyQuery as useSuspenseQuery returns it; `options` (`select`, …) override its defaults. It has no select of its own, so the data is TData. */
export function useEmergency<TData = Emergency>(options?: Omit<UseSuspenseQueryOptions<Emergency, Error, TData, string[]>, "queryKey" | "queryFn">) {
  return useSuspenseQuery({ ...emergencyQuery, ...options } as UseSuspenseQueryOptions<Emergency, Error, TData, string[]>);
}
