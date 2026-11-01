// Uploads: the files kept for a record (a photo, a paper's pages),
// whatever the record. `putUpload` takes one as a form, the store
// sniffs and keeps it (src/server/files/store.ts), and the bytes are served
// back behind the gate at /api/files/<id>/<variant> (src/api/rest/files.ts).
//
// A record's save sends its upload first: `withUpload` (below) in its `send`,
// so a picture taken offline waits on the phone with its record, and both go
// together. See docs/architecture.md, Uploads.

import { createServerFn } from "@tanstack/react-start";
import { forgetOnPhone, onPhone } from "../../app/model/uploads";
import { PeopleRepo } from "../../db/models/people/repo";
import type { Made } from "../../lib/outbox";
import { stamped } from "../../lib/outbox";
import { getDb } from "../../server/core/db";
import { personId } from "../../server/core/person";
import { keepUpload, readUpload } from "../../server/files/store";

/** Someone still here, by id; else nobody (a phone that hasn't said, or a person since forgotten). */
function known(id: string | null | undefined): string | null {
  return id && new PeopleRepo(getDb()).get(id) ? id : null;
}

/**
 * Keep an upload, sent as `multipart/form-data`: `id` (the phone's), `name`,
 * `original`, and for a picture `display`, `thumb`, `width` and `height`.
 * One already kept is left as it is, so sending it twice is safe.
 */
export const putUpload = createServerFn({ method: "POST" })
  .validator((data: FormData) => {
    if (!(data instanceof FormData)) throw new Error("An upload is sent as a form");
    return data;
  })
  // When it arrived, not when it was made: an upload's age is how long it has waited here for its record.
  .handler(async ({ data }) => keepUpload(getDb(), await readUpload(data), known(personId())));

/** Send an upload still on this phone; nothing if it's up already (a send cut off after it went). */
export async function sendUpload(id: string, made: Made): Promise<void> {
  const upload = await onPhone(id);
  if (!upload) return;
  const form = new FormData();
  form.set("id", id);
  form.set("name", upload.name);
  if (upload.width !== null) form.set("width", String(upload.width));
  if (upload.height !== null) form.set("height", String(upload.height));
  for (const [variant, part] of Object.entries(upload.parts)) if (part) form.set(variant, part, variant === "original" ? upload.name : `${variant}.jpg`);
  await putUpload({ data: form, headers: stamped(made) });
}

/** Turned away for good: a 4xx, but not a lost session (which keeps it, to go once logged in again). */
function refused(error: unknown): boolean {
  return error instanceof Response && error.status >= 400 && error.status < 500 && error.status !== 401;
}

/**
 * A record's save with its upload: the upload first (if it's still on this
 * phone), then `then` (the record's own server function), then the phone's
 * copy is forgotten. Run again after a dropped connection, it does it all
 * again, and both sides keep one. Turned away, the phone's copy goes too.
 */
export function withUpload<T>(fileId: string, made: Made, then: () => Promise<T>): Promise<T> {
  return withUploads([fileId], made, then);
}

/** As `withUpload`, for a record with several (a paper's pages): every upload first, in order, then the record. */
export async function withUploads<T>(fileIds: readonly string[], made: Made, then: () => Promise<T>): Promise<T> {
  try {
    for (const id of fileIds) await sendUpload(id, made);
    const result = await then();
    for (const id of fileIds) await forgetOnPhone(id);
    return result;
  } catch (error) {
    if (refused(error)) for (const id of fileIds) await forgetOnPhone(id);
    throw error;
  }
}
