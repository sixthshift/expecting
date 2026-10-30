// Results and papers: a result, a letter, a plan, a record, or something else,
// on the date it bears, its pages photographed or a PDF. Shared, as notes
// are: either of you keeps one, sees all, and can change or delete any; each
// says who kept it and who changed it last. The pages are uploads
// (./files.ts), sent first by the same save (src/lib/papers.ts).

import { queryOptions, type UseSuspenseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { FilesRepo } from "../../db/models/files/repo";
import { PapersRepo } from "../../db/models/papers/repo";
import { PeopleRepo } from "../../db/models/people/repo";
import { isISODate } from "../../lib/dates";
import { FILE_TYPES } from "../../lib/files";
import { save, stamped } from "../../lib/outbox";
import { MAX_PAGES, offlineFiles, PAPER_KINDS, type Paper, type PaperChange, type PaperInput, tidyTitle, tidyWords } from "../../lib/papers";
import { keepHandyOffline } from "../../pwa/register";
import { getDb } from "../../server/core/db";
import { madeAt } from "../../server/core/madeAt";
import { personId } from "../../server/core/person";
import { dropUpload } from "../../server/files/store";
import { withUploads } from "./files";

/** Someone still here, by id; else nobody (a phone that hasn't said, or a person since forgotten). */
function known(id: string | null | undefined): string | null {
  return id && new PeopleRepo(getDb()).get(id) ? id : null;
}

const change = {
  id: z.uuid(),
  kind: z.enum(PAPER_KINDS),
  title: z.string().trim().min(1).max(200),
  itemId: z
    .string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    .max(120)
    .nullable(),
  day: z.string().refine(isISODate, "Not a date"),
  note: z.string().max(2_000).nullable(),
  handy: z.boolean(),
};

/** A page as the phone knows it: only its upload's id is believed. */
const page = z.object({ fileId: z.uuid(), type: z.enum(FILE_TYPES), name: z.string().max(200), size: z.number().int().nonnegative() }).strict();

export const listPapers = createServerFn({ method: "GET" }).handler(() => new PapersRepo(getDb()).list());

export const addPaper = createServerFn({ method: "POST" })
  .validator(
    z
      .object({ ...change, pages: z.array(page).min(1).max(MAX_PAGES) })
      .strict()
      .refine((p) => new Set(p.pages.map((pg) => pg.fileId)).size === p.pages.length, "A page twice")
  )
  .handler(({ data }) => {
    const db = getDb();
    // Its pages go first, in the same save: without them, the paper never arrived.
    const files = new FilesRepo(db);
    if (data.pages.some((p) => !files.get(p.fileId))) throw Response.json({ error: "A page didn't arrive" }, { status: 400 });
    return new PapersRepo(db).add(data, known(personId()), madeAt());
  });

export const editPaper = createServerFn({ method: "POST" })
  .validator(z.object(change).strict())
  .handler(({ data }) => new PapersRepo(getDb()).edit(data, known(personId()), madeAt()));

/** Gone from both phones, every page: nothing to put back, so the page asks first. */
export const deletePaper = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid() }).strict())
  .handler(async ({ data }) => {
    const db = getDb();
    for (const fileId of new PapersRepo(db).delete(data.id)) await dropUpload(db, fileId);
  });

/** Every result and paper, kept by either of you. */
export type Papers = Paper[];

/** Fetched with the app's frame, so each phone has the list (and the handy papers' pages) for when there's no signal. */
export const papersQuery = queryOptions({
  queryKey: ["papers"],
  queryFn: async (): Promise<Papers> => {
    const papers = await listPapers();
    void keepHandyOffline(offlineFiles(papers));
    return papers;
  },
});

/** Papers' saves, through the outbox (src/app/model/outbox.ts): each shows at once, and is sent when it can be, a new one's pages first. */
export const papersSaves = {
  addPaper: save({
    key: "addPaper",
    query: papersQuery.queryKey,
    send: (data: PaperInput, made) =>
      withUploads(
        data.pages.map((p) => p.fileId),
        made,
        () => addPaper({ data, headers: stamped(made) })
      ),
    apply: (papers: Papers, input, made) =>
      papers.some((p) => p.id === input.id)
        ? papers
        : [
            ...papers,
            {
              ...input,
              title: tidyTitle(input.title),
              note: tidyWords(input.note),
              by: made.by,
              createdAt: made.at,
              editedBy: null,
              editedAt: null,
            },
          ],
  }),
  editPaper: save({
    key: "editPaper",
    query: papersQuery.queryKey,
    send: (data: PaperChange, made) => editPaper({ data, headers: stamped(made) }),
    apply: (papers: Papers, input, made) =>
      papers.map((p) =>
        p.id === input.id ? { ...p, ...input, title: tidyTitle(input.title), note: tidyWords(input.note), editedBy: made.by, editedAt: made.at } : p
      ),
  }),
  deletePaper: save({
    key: "deletePaper",
    query: papersQuery.queryKey,
    send: (data: { id: string }, made) => deletePaper({ data, headers: stamped(made) }),
    apply: (papers: Papers, { id }) => papers.filter((p) => p.id !== id),
  }),
};

/** papersQuery as useSuspenseQuery returns it; `options` (`select`, …) override its defaults. It has no select of its own, so the data is TData. */
export function usePapers<TData = Papers>(options?: Omit<UseSuspenseQueryOptions<Papers, Error, TData, string[]>, "queryKey" | "queryFn">) {
  return useSuspenseQuery({ ...papersQuery, ...options } as UseSuspenseQueryOptions<Papers, Error, TData, string[]>);
}
