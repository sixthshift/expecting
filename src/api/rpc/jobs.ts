// Who does what. Every call is as the person holding this phone: the server
// returns their own answers, and the other's only for a job both have answered.

import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { JobsRepo } from "../../db/models/jobs/repo";
import { isJobId, type JobsView, PICKS, type Pick } from "../../lib/drawer/jobs";
import { save, stamped } from "../../lib/outbox";
import { getDb } from "../../server/core/db";
import { madeAt } from "../../server/core/madeAt";
import { personId } from "../../server/core/person";
import { queryHook } from "../queryHook";

const jobId = z.string().refine(isJobId, "not a job in src/lib/drawer/jobs.ts");

const getJobs = createServerFn({ method: "GET" }).handler(() => new JobsRepo(getDb()).view(personId()));

const pickJob = createServerFn({ method: "POST" })
  .validator(z.object({ jobId, pick: z.enum(PICKS) }).strict())
  .handler(({ data }) => new JobsRepo(getDb()).pick(data.jobId, personId(), data.pick, madeAt()));

const unpickJob = createServerFn({ method: "POST" })
  .validator(z.object({ jobId }).strict())
  .handler(({ data }) => new JobsRepo(getDb()).unpick(data.jobId, personId()));

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

export const useJobsQuery = queryHook(jobsQuery);
