// The phone's half of an upload (the store is src/server/files/store.ts):
//
//   made ready   a picture is checked (its first bytes, its size), its day
//                read from its EXIF, and drawn twice smaller, as a display
//                copy and a thumbnail; a PDF goes as it is
//   kept         its parts are written to this phone (IndexedDB: pictures
//                don't fit in localStorage) before the save that needs them
//                is made, so one taken offline, in a hospital car park, waits
//                and goes up later; its id is listed in localStorage, so the
//                page knows at once which pictures are still only here
//   sent         by its record's save (`withUpload`, src/api/rpc/files.ts),
//                upload first, then the record; then forgotten here
//
// Without IndexedDB (a private window that refuses it) the parts are kept in
// the page only, as the outbox keeps saves then.

import { exifTakenAt, type TakenAt } from "../../lib/exif";
import { type FileProblem, type FileType, fitWithin, isImage, MADE_AT, MADE_TYPE, MAX_ORIGINAL, sniff, type Variant } from "../../lib/files";

/** A file that can't be kept, and why, in words for the person who chose it (`FILE_PROBLEM`). */
export class FileProblemError extends Error {
  constructor(readonly problem: FileProblem) {
    super(problem);
  }
}

/** An upload, made ready on this phone: what it is, and its parts. */
export type Held = { name: string; type: FileType; size: number; width: number | null; height: number | null; parts: Partial<Record<Variant, Blob>> };

/** Made ready, with the day its camera says it was taken, if it says. */
export type Prepared = Held & { takenAt: TakenAt | null };

/** A picture decoded, upright (the browser turns it by its EXIF), and how to let it go. */
type Decoded = { source: CanvasImageSource; width: number; height: number; close: () => void };

async function decode(file: Blob): Promise<Decoded | null> {
  try {
    const bitmap = await createImageBitmap(file);
    return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
  } catch {
    // Safari's createImageBitmap can refuse what its <img> opens (HEIC, some PNGs).
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => URL.revokeObjectURL(url) };
  } catch {
    URL.revokeObjectURL(url);
    return null;
  }
}

/** A smaller JPEG of `picture`, for `variant`. */
function drawn(picture: Decoded, variant: "display" | "thumb"): Promise<Blob> {
  const { edge, quality } = MADE_AT[variant];
  const size = fitWithin(picture.width, picture.height, edge);
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext("2d");
  if (!context) return Promise.reject(new FileProblemError("unreadable"));
  context.imageSmoothingQuality = "high";
  context.drawImage(picture.source, 0, 0, size.width, size.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => {
        // Safari holds a canvas's memory until it's emptied.
        canvas.width = 0;
        canvas.height = 0;
        if (blob) resolve(blob);
        else reject(new FileProblemError("unreadable"));
      },
      MADE_TYPE,
      quality
    )
  );
}

/** Make a file ready to keep: a picture with its display copy, thumbnail and day; a PDF as it is. Throws a FileProblemError. */
export async function prepareFile(file: File): Promise<Prepared> {
  if (file.size > MAX_ORIGINAL) throw new FileProblemError("big");
  const type = sniff(new Uint8Array(await file.slice(0, 16).arrayBuffer()));
  if (!type) throw new FileProblemError("type");
  const name = file.name || "upload";
  if (!isImage(type)) return { name, type, size: file.size, width: null, height: null, parts: { original: file }, takenAt: null };

  const takenAt = type === "image/jpeg" ? exifTakenAt(new Uint8Array(await file.slice(0, 128 * 1024).arrayBuffer())) : null;
  const picture = await decode(file);
  if (!picture) throw new FileProblemError(type === "image/heic" || type === "image/heif" ? "heic" : "unreadable");
  try {
    const display = await drawn(picture, "display");
    const thumb = await drawn(picture, "thumb");
    return { name, type, size: file.size, width: picture.width, height: picture.height, parts: { original: file, display, thumb }, takenAt };
  } finally {
    picture.close();
  }
}

/** Only for what has no picture to show yet: an image's own preview, before it's kept. */
export function previewUrl(prepared: Prepared): string | null {
  const part = prepared.parts.thumb ?? prepared.parts.display;
  return part ? URL.createObjectURL(part) : null;
}

// Kept on the phone until sent.

/** The phone's IndexedDB for uploads waiting to go. */
export const UPLOADS_DB = "expecting-uploads";
const STORE = "waiting";
/** The ids waiting, in localStorage: read at once, as a page draws. */
export const WAITING_KEY = "expecting-uploads-waiting";

/** This page's own copy: what was kept here, and the URLs it's drawn from, so a picture shows the moment it's kept. */
const held = new Map<string, Held>();
const urls = new Map<string, string>();

function waitingIds(): string[] {
  try {
    const kept = JSON.parse(localStorage.getItem(WAITING_KEY) ?? "[]");
    return Array.isArray(kept) ? kept : [];
  } catch {
    return [];
  }
}

function writeWaiting(ids: string[]): void {
  try {
    if (ids.length === 0) localStorage.removeItem(WAITING_KEY);
    else localStorage.setItem(WAITING_KEY, JSON.stringify(ids));
  } catch {
    // No storage: kept in the page only.
  }
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(UPLOADS_DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function run<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const request = work(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(request.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

/** Keep an upload's parts on this phone until its record's save sends them. Resolves once they're written (or kept in the page, without IndexedDB). */
export async function keepOnPhone(id: string, upload: Held): Promise<void> {
  const { name, type, size, width, height, parts } = upload;
  const kept: Held = { name, type, size, width, height, parts };
  held.set(id, kept);
  writeWaiting([...waitingIds().filter((w) => w !== id), id]);
  try {
    await run("readwrite", (store) => store.put(kept, id));
  } catch {
    // Kept in the page only: sent while it's open.
  }
}

/** An upload still on this phone, or null: sent already, or never kept here. */
export async function onPhone(id: string): Promise<Held | null> {
  const here = held.get(id);
  if (here) return here;
  if (!waitingIds().includes(id)) return null;
  try {
    return ((await run("readonly", (store) => store.get(id))) as Held | undefined) ?? null;
  } catch {
    return null;
  }
}

/** Forget an upload on this phone: it's up, or it was turned away. A picture already drawn from it stays drawn. */
export async function forgetOnPhone(id: string): Promise<void> {
  held.delete(id);
  writeWaiting(waitingIds().filter((w) => w !== id));
  try {
    await run("readwrite", (store) => store.delete(id));
  } catch {
    // Nothing kept there.
  }
}

/** Whether an upload is still waiting on this phone (not yet up), as far as this page knows at once. */
export function isOnPhone(id: string): boolean {
  return held.has(id) || waitingIds().includes(id);
}

/** A URL for a part kept on this phone, if this page has one already: drawn at once, offline too. */
export function phoneUrl(id: string, variant: Variant): string | null {
  const key = `${id}/${variant}`;
  const made = urls.get(key);
  if (made) return made;
  const part = held.get(id)?.parts[variant];
  if (!part) return null;
  const url = URL.createObjectURL(part);
  urls.set(key, url);
  return url;
}

/** A URL for a part kept on this phone, from IndexedDB if this page didn't keep it (the app closed and opened again). */
export async function loadPhoneUrl(id: string, variant: Variant): Promise<string | null> {
  const ready = phoneUrl(id, variant);
  if (ready) return ready;
  const upload = await onPhone(id);
  if (!upload) return null;
  held.set(id, upload);
  return phoneUrl(id, variant);
}
