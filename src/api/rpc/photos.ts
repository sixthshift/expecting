// Photos and scans: a bump photo, a scan, or something else, on its day.
// Shared, as notes are: either of you keeps one, sees all, and can change or
// delete any; each says who kept it and who changed it last. The picture is
// an upload (./files.ts), sent first by the same save (src/lib/photos.ts).

import { queryOptions, type UseSuspenseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { FilesRepo } from "../../db/models/files/repo";
import { PeopleRepo } from "../../db/models/people/repo";
import { PhotosRepo } from "../../db/models/photos/repo";
import { isISODate } from "../../lib/dates";
import { TIME } from "../../lib/journal";
import { save, stamped } from "../../lib/outbox";
import { PHOTO_KINDS, type Photo, type PhotoChange, type PhotoInput, tidyCaption } from "../../lib/photos";
import { getDb } from "../../server/core/db";
import { madeAt } from "../../server/core/madeAt";
import { personId } from "../../server/core/person";
import { dropUpload } from "../../server/files/store";
import { withUpload } from "./files";

/** Someone still here, by id; else nobody (a phone that hasn't said, or a person since forgotten). */
function known(id: string | null | undefined): string | null {
  return id && new PeopleRepo(getDb()).get(id) ? id : null;
}

const change = {
  id: z.uuid(),
  kind: z.enum(PHOTO_KINDS),
  day: z.string().refine(isISODate, "Not a date"),
  time: z.string().regex(TIME).nullable(),
  caption: z.string().max(2_000).nullable(),
};

export const listPhotos = createServerFn({ method: "GET" }).handler(() => new PhotosRepo(getDb()).list());

export const addPhoto = createServerFn({ method: "POST" })
  .validator(z.object({ ...change, fileId: z.uuid() }).strict())
  .handler(({ data }) => {
    const db = getDb();
    // Its upload goes first, in the same save: without it, the picture never arrived.
    if (!new FilesRepo(db).get(data.fileId)) throw Response.json({ error: "The photo didn't arrive" }, { status: 400 });
    return new PhotosRepo(db).add(data, known(personId()), madeAt());
  });

export const editPhoto = createServerFn({ method: "POST" })
  .validator(z.object(change).strict())
  .handler(({ data }) => new PhotosRepo(getDb()).edit(data, known(personId()), madeAt()));

/** Gone from both phones, picture and all: nothing to put back, so the page asks first. */
export const deletePhoto = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid() }).strict())
  .handler(async ({ data }) => {
    const db = getDb();
    const fileId = new PhotosRepo(db).delete(data.id);
    if (fileId) await dropUpload(db, fileId);
  });

/** Every photo and scan, kept by either of you. */
export type Photos = Photo[];
export const photosQuery = queryOptions({ queryKey: ["photos"], queryFn: (): Promise<Photos> => listPhotos() });

/** Photos' saves, through the outbox (src/app/model/outbox.ts): each shows at once, and is sent when it can be, a new one's picture first. */
export const photosSaves = {
  addPhoto: save({
    key: "addPhoto",
    query: photosQuery.queryKey,
    send: (data: PhotoInput, made) => withUpload(data.fileId, made, () => addPhoto({ data, headers: stamped(made) })),
    apply: (photos: Photos, input, made) =>
      photos.some((p) => p.id === input.id)
        ? photos
        : [...photos, { ...input, caption: tidyCaption(input.caption), by: made.by, createdAt: made.at, editedBy: null, editedAt: null }],
  }),
  editPhoto: save({
    key: "editPhoto",
    query: photosQuery.queryKey,
    send: (data: PhotoChange, made) => editPhoto({ data, headers: stamped(made) }),
    apply: (photos: Photos, input, made) =>
      photos.map((p) => (p.id === input.id ? { ...p, ...input, caption: tidyCaption(input.caption), editedBy: made.by, editedAt: made.at } : p)),
  }),
  deletePhoto: save({
    key: "deletePhoto",
    query: photosQuery.queryKey,
    send: (data: { id: string }, made) => deletePhoto({ data, headers: stamped(made) }),
    apply: (photos: Photos, { id }) => photos.filter((p) => p.id !== id),
  }),
};

/** photosQuery as useSuspenseQuery returns it; `options` (`select`, …) override its defaults. It has no select of its own, so the data is TData. */
export function usePhotosQuery<TData = Photos>(options?: Omit<UseSuspenseQueryOptions<Photos, Error, TData, string[]>, "queryKey" | "queryFn">) {
  return useSuspenseQuery({ ...photosQuery, ...options } as UseSuspenseQueryOptions<Photos, Error, TData, string[]>);
}
