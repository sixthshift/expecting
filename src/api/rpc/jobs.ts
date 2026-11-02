// Who does what. Every call is as the person holding this phone: the server
// returns their own answers, and the other's only for a job both have answered.

import { queryOptions, type UseSuspenseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { JobsRepo } from "../../db/models/jobs/repo";
import { PeopleRepo } from "../../db/models/people/repo";
import { isJobId, type JobsView, PICKS, type Pick } from "../../lib/jobs";
import { save, stamped } from "../../lib/outbox";
import { getDb } from "../../server/core/db";
import { madeAt } from "../../server/core/madeAt";
import { personId } from "../../server/core/person";

/** Who's answering: the person this phone says it is. A phone that hasn't said can't answer. */
function player(): string {
  const id = personId();
  if (!id || !new PeopleRepo(getDb()).get(id)) throw new Error("Say who's holding this phone first");
  return id;
}

const jobId = z.string().refine(isJobId, "not a job in src/lib/jobs.ts");

export const getJobs = createServerFn({ method: "GET" }).handler(() => new JobsRepo(getDb()).view(player()));

export const pickJob = createServerFn({ method: "POST" })
  .validator(z.object({ jobId, pick: z.enum(PICKS) }).strict())
  .handler(({ data }) => new JobsRepo(getDb()).pick(data.jobId, player(), data.pick, madeAt()));

export const unpickJob = createServerFn({ method: "POST" })
  .validator(z.object({ jobId }).strict())
  .handler(({ data }) => new JobsRepo(getDb()).unpick(data.jobId, player()));

export type { JobsView };
export const jobsQuery = queryOptions({ queryKey: ["jobs"], queryFn: () => getJobs() });

/** Who does what's saves, through the outbox (src/app/model/outbox.ts): your answer shows at once; the other's comes with the next fetch. */
export const jobsSaves = {
  pickJob: save({
    key: "pickJob",
    query: jobsQuery.queryKey,
    send: (data: { jobId: string; pick: Pick }, made) => pickJob({ data, headers: stamped(made) }),
    apply: (view: JobsView, { jobId, pick }) => ({ ...view, answers: view.answers.map((a) => (a.jobId === jobId ? { ...a, mine: pick } : a)) }),
  }),
  unpickJob: save({
    key: "unpickJob",
    query: jobsQuery.queryKey,
    send: (data: { jobId: string }, made) => unpickJob({ data, headers: stamped(made) }),
    // Taken back, the other's answer is hidden again.
    apply: (view: JobsView, { jobId }) => ({ ...view, answers: view.answers.map((a) => (a.jobId === jobId ? { ...a, mine: null, theirs: null } : a)) }),
  }),
};

/** jobsQuery as useSuspenseQuery returns it; `options` (`select`, …) override its defaults. It has no select of its own, so the data is TData. */
export function useJobsQuery<TData = JobsView>(options?: Omit<UseSuspenseQueryOptions<JobsView, Error, TData, string[]>, "queryKey" | "queryFn">) {
  return useSuspenseQuery({ ...jobsQuery, ...options } as UseSuspenseQueryOptions<JobsView, Error, TData, string[]>);
}
