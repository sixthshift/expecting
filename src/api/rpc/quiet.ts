// Something has happened: whether Expecting is quiet for both of you, why,
// who said so and when (src/lib/quiet.ts).

import { queryOptions, type UseSuspenseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PeopleRepo } from "../../db/models/people/repo";
import { QuietRepo } from "../../db/models/quiet/repo";
import { save, stamped } from "../../lib/outbox";
import { canBecome, QUIET_KINDS, type Quiet, type QuietKind } from "../../lib/quiet";
import { getDb } from "../../server/core/db";
import { madeAt } from "../../server/core/madeAt";
import { personId } from "../../server/core/person";

/** What has happened, or null while nothing has. */
export const getQuiet = createServerFn({ method: "GET" }).handler(() => new QuietRepo(getDb()).get());

/** Something has happened, said by the person holding this phone. Hard news can become a loss, never the other way. */
export const setQuiet = createServerFn({ method: "POST" })
  .validator(z.object({ kind: z.enum(QUIET_KINDS) }).strict())
  .handler(({ data }) => {
    const db = getDb();
    const repo = new QuietRepo(db);
    const current = repo.get();
    if (!canBecome(current, data.kind)) return current;
    const id = personId();
    return repo.set(data.kind, id && new PeopleRepo(db).get(id) ? id : null, madeAt());
  });

/** Expecting comes back, as it was: nothing put aside was deleted. */
export const clearQuiet = createServerFn({ method: "POST" }).handler(() => {
  new QuietRepo(getDb()).clear();
  return null;
});

export const quietQuery = queryOptions({ queryKey: ["quiet"], queryFn: () => getQuiet() });

/** Quiet's saves, through the outbox (src/app/model/outbox.ts): each shows at once, and is sent when it can be. */
export const quietSaves = {
  setQuiet: save({
    key: "setQuiet",
    query: quietQuery.queryKey,
    send: (data: { kind: QuietKind }, made) => setQuiet({ data, headers: stamped(made) }),
    apply: (quiet: Quiet | null, { kind }, made): Quiet | null => (canBecome(quiet, kind) ? { kind, setBy: made.by, setAt: made.at } : quiet),
  }),
  clearQuiet: save({
    key: "clearQuiet",
    query: quietQuery.queryKey,
    send: (_: null, made) => clearQuiet({ headers: stamped(made) }),
    apply: (): Quiet | null => null,
  }),
};

/** quietQuery as useSuspenseQuery returns it; `options` (`select`, …) override its defaults. It has no select of its own, so the data is TData. */
export function useQuietQuery<TData = Quiet | null>(options?: Omit<UseSuspenseQueryOptions<Quiet | null, Error, TData, string[]>, "queryKey" | "queryFn">) {
  return useSuspenseQuery({ ...quietQuery, ...options } as UseSuspenseQueryOptions<Quiet | null, Error, TData, string[]>);
}
