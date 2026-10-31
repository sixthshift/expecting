// The file store: uploads' bytes, on disk in DATA_DIR/uploads/<id>/, beside
// the database on the same volume, so the one backup takes both. Each upload
// is a folder holding `original` (the file as given, untouched) and, for a
// picture, `display` and `thumb` (JPEGs made on the phone). Its row is
// `upload` (src/db/models/files/). Any record can keep one: it points at the
// upload, and deleting the record drops it. See docs/plan-photos-scans.md.

import type { Database } from "bun:sqlite";
import { existsSync } from "node:fs";
import { mkdir, rename, rm } from "node:fs/promises";
import { join } from "node:path";
import { FilesRepo } from "../../db/models/files/repo";
import { type FileType, MADE_TYPE, MAX_MADE, MAX_ORIGINAL, sniff, type Upload, type Variant } from "../../lib/files";
import { dataDir } from "../core/boot";

/** Where the uploads are: a folder beside the database. */
function uploadsDir(dir: string = dataDir()): string {
  return join(dir, "uploads");
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** An upload's bytes on disk. Never trusts an id it's handed: only a UUID names a folder. */
export class FileStore {
  constructor(readonly root: string = uploadsDir()) {}

  private folder(id: string): string {
    if (!UUID.test(id)) throw new Error(`Not an upload id: ${id}`);
    return join(this.root, id);
  }

  has(id: string): boolean {
    return existsSync(this.folder(id));
  }

  /**
   * Write an upload's parts. Into a folder of its own first, then renamed into
   * place, so a half-written upload is never served. One already here is left
   * as it is: the same upload, sent twice.
   */
  async put(id: string, parts: Partial<Record<Variant, Blob>>): Promise<void> {
    const folder = this.folder(id);
    if (existsSync(folder)) return;
    const writing = join(this.root, `.${id}.${crypto.randomUUID()}`);
    await mkdir(writing, { recursive: true });
    try {
      for (const [variant, blob] of Object.entries(parts)) if (blob) await Bun.write(join(writing, variant), blob);
      await rename(writing, folder);
    } catch (error) {
      await rm(writing, { recursive: true, force: true });
      // Another send of the same upload got there first.
      if (existsSync(folder)) return;
      throw error;
    }
  }

  /** The path of an upload's part, if it has it. */
  path(id: string, variant: Variant): string | null {
    const path = join(this.folder(id), variant);
    return existsSync(path) ? path : null;
  }

  async remove(id: string): Promise<void> {
    await rm(this.folder(id), { recursive: true, force: true });
  }
}

/** An upload as sent, checked: the bytes, and what they are. */
export type Received = {
  id: string;
  name: string;
  type: FileType;
  size: number;
  width: number | null;
  height: number | null;
  parts: Partial<Record<Variant, Blob>>;
};

function refuse(reason: string): Response {
  return Response.json({ error: reason }, { status: 400 });
}

async function head(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.slice(0, 16).arrayBuffer());
}

function dimension(value: FormDataEntryValue | null): number | null {
  if (value === null || value === "") return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 50_000) throw refuse("Not a size");
  return n;
}

/**
 * An upload as a phone sends it (`multipart/form-data`): `id`, `original`
 * (the file), and for a picture `display`, `thumb`, `width` and `height`.
 * Each part's type is sniffed from its first bytes; anything the store
 * doesn't take, or too big, is a 400.
 */
export async function readUpload(form: FormData): Promise<Received> {
  const id = form.get("id");
  if (typeof id !== "string" || !UUID.test(id)) throw refuse("No upload id");
  const original = form.get("original");
  if (!(original instanceof Blob) || original.size === 0) throw refuse("No file");
  if (original.size > MAX_ORIGINAL) throw refuse("Too big");
  const type = sniff(await head(original));
  if (!type) throw refuse("Not a file Expecting keeps");

  const parts: Partial<Record<Variant, Blob>> = { original };
  for (const variant of ["display", "thumb"] as const) {
    const made = form.get(variant);
    if (made === null) continue;
    if (!(made instanceof Blob) || made.size === 0 || made.size > MAX_MADE[variant]) throw refuse(`A ${variant} copy that doesn't fit`);
    if (sniff(await head(made)) !== MADE_TYPE) throw refuse(`A ${variant} copy that isn't a JPEG`);
    parts[variant] = made;
  }

  const given = form.get("name");
  const named = typeof given === "string" && given.trim() ? given : original instanceof File ? original.name : "";
  const name = named.trim().slice(0, 200) || "upload";
  return { id, name, type, size: original.size, width: dimension(form.get("width")), height: dimension(form.get("height")), parts };
}

/** How long an upload may wait for its record before it's swept: its record follows in seconds. */
const UNCLAIMED_AFTER_MS = 86_400_000;

/**
 * Keep an upload: its bytes, then its row. One already here (the same upload,
 * sent again after a dropped connection) is left as it is. Then sweeps any
 * upload whose record never came.
 */
export async function keepUpload(db: Database, received: Received, by: string | null, now: Date = new Date(), store = new FileStore()): Promise<Upload> {
  const files = new FilesRepo(db);
  const kept = files.get(received.id);
  if (kept) return kept;
  await store.put(received.id, received.parts);
  const row: Upload = {
    id: received.id,
    name: received.name,
    type: received.type,
    size: received.size,
    width: received.width,
    height: received.height,
    display: Boolean(received.parts.display),
    thumb: Boolean(received.parts.thumb),
    by,
    createdAt: now.toISOString(),
  };
  let added: Upload;
  try {
    added = files.add(row);
  } catch (error) {
    await store.remove(received.id);
    throw error;
  }
  for (const id of files.unclaimed(new Date(now.getTime() - UNCLAIMED_AFTER_MS))) await dropUpload(db, id, store);
  return added;
}

/** Forget an upload, row and bytes. Its record's row goes first: the reference holds it. */
export async function dropUpload(db: Database, id: string, store = new FileStore()): Promise<void> {
  new FilesRepo(db).delete(id);
  await store.remove(id);
}
