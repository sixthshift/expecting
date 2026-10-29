// The extras the household has turned on or off (content/extras.yaml), each
// with who changed it and when.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { EXTRAS, extra } from "../../content/extras";
import { ExtrasRepo } from "../../db/models/extras/repo";
import { PeopleRepo } from "../../db/models/people/repo";
import { getDb } from "../../server/core/db";
import { personId } from "../../server/core/person";

/** Every extra someone has decided on; ones no longer in extras.yaml are left out. */
export const getExtras = createServerFn({ method: "GET" }).handler(() => new ExtrasRepo(getDb()).list().filter((c) => extra(c.id) !== undefined));

/** Turn extras on or off, several at once (onboarding's choice). The person holding this phone changed them. */
export const setExtras = createServerFn({ method: "POST" })
  .validator(
    z.array(z.object({ id: z.string().refine((id) => extra(id) !== undefined, "not an extra in extras.yaml"), on: z.boolean() }).strict()).max(EXTRAS.length)
  )
  .handler(({ data }) => {
    const db = getDb();
    const id = personId();
    const changedBy = id && new PeopleRepo(db).get(id) ? id : null;
    const repo = new ExtrasRepo(db);
    return data.map((c) => repo.set({ ...c, changedBy }));
  });
