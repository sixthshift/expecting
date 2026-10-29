// The extras the household has turned on or off (src/features/settings/model/extras.data.ts), each
// with who changed it and when.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ExtrasRepo } from "../../db/models/extras/repo";
import { PeopleRepo } from "../../db/models/people/repo";
import { EXTRAS, extra } from "../../features/settings/model/extras";
import { getDb } from "../../server/core/db";
import { personId } from "../../server/core/person";

/** Turn extras on or off, several at once (onboarding's choice). The person holding this phone changed them. */
export const setExtras = createServerFn({ method: "POST" })
  .validator(
    z.array(z.object({ id: z.string().refine((id) => extra(id) !== undefined, "not an extra in extras.data.ts"), on: z.boolean() }).strict()).max(EXTRAS.length)
  )
  .handler(({ data }) => {
    const db = getDb();
    const id = personId();
    const changedBy = id && new PeopleRepo(db).get(id) ? id : null;
    const repo = new ExtrasRepo(db);
    return data.map((c) => repo.set({ ...c, changedBy }));
  });
