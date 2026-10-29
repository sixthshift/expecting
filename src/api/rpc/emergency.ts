// Emergency info: the page to open when something goes wrong. Shared by both of you, so any
// phone can read and change it; a change says who made it, if the phone has said.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { EmergencyRepo } from "../../db/models/emergency/repo";
import { PeopleRepo } from "../../db/models/people/repo";
import { EMERGENCY_IDS, EMERGENCY_MAX, tidyValue } from "../../lib/emergency";
import { getDb } from "../../server/core/db";
import { personId } from "../../server/core/person";

export const getEmergency = createServerFn({ method: "GET" }).handler(() => new EmergencyRepo(getDb()).get());

const value = z.string().transform(tidyValue).pipe(z.string().max(EMERGENCY_MAX));

export const saveEmergency = createServerFn({ method: "POST" })
  .validator(z.partialRecord(z.enum(EMERGENCY_IDS), value))
  .handler(({ data }) => {
    const id = personId();
    const by = id && new PeopleRepo(getDb()).get(id) ? id : null;
    new EmergencyRepo(getDb()).set(data as Record<string, string>, by);
  });
