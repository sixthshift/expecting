import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { FilesRepo } from "../../src/db/models/files/repo";
import { PhotosRepo } from "../../src/db/models/photos/repo";
import { serveFile } from "../../src/server/files/serve";
import { dropUpload, FileStore, keepUpload, readUpload } from "../../src/server/files/store";
import { useTestDb } from "../db/helpers";

// The file store: an upload as a phone sends it, checked by its bytes, kept
// on disk and in its row, once however often it's sent, served back by the
// route, and dropped with its record.
const db = useTestDb();
let dir: string;
let store: FileStore;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "expecting-uploads-"));
  store = new FileStore(join(dir, "uploads"));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

const ID = "11111111-1111-4111-8111-111111111111";
const NOW = new Date("2026-10-30T00:00:00Z");
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4]);
const PDF = new TextEncoder().encode("%PDF-1.7\n...");

function form(fields: Record<string, string | Blob>): FormData {
  const f = new FormData();
  for (const [key, value] of Object.entries(fields)) f.set(key, value);
  return f;
}

const photo = () =>
  form({
    id: ID,
    name: "IMG_2041.jpg",
    width: "3024",
    height: "4032",
    original: new File([JPEG], "IMG_2041.jpg"),
    display: new Blob([JPEG]),
    thumb: new Blob([JPEG]),
  });

async function refusal(promise: Promise<unknown>): Promise<number> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof Response) return error.status;
    throw error;
  }
  return 200;
}

describe("readUpload", () => {
  test("a picture, its copies and its size; a PDF on its own", async () => {
    const read = await readUpload(photo());
    expect(read).toMatchObject({ id: ID, name: "IMG_2041.jpg", type: "image/jpeg", size: JPEG.length, width: 3024, height: 4032 });
    expect(Object.keys(read.parts).sort()).toEqual(["display", "original", "thumb"]);
    expect(await readUpload(form({ id: ID, original: new File([PDF], "Glucose results.pdf") }))).toMatchObject({
      type: "application/pdf",
      name: "Glucose results.pdf",
      width: null,
    });
  });

  test("its type from its bytes: a page dressed as a photo is turned away", async () => {
    expect(await refusal(readUpload(form({ id: ID, original: new File(["<svg onload=alert(1)>"], "bump.jpg", { type: "image/jpeg" }) })))).toBe(400);
    expect(await refusal(readUpload(form({ id: ID, original: new File([JPEG], "a.jpg"), thumb: new Blob(["<html>"]) })))).toBe(400);
    expect(await refusal(readUpload(form({ id: "../../etc", original: new File([JPEG], "a.jpg") })))).toBe(400);
    expect(await refusal(readUpload(form({ id: ID })))).toBe(400);
    expect(await refusal(readUpload(form({ id: ID, original: new File([JPEG], "a.jpg"), width: "-3" })))).toBe(400);
  });
});

describe("keepUpload", () => {
  test("its bytes on disk and its row, once however often it's sent, served back behind its id", async () => {
    const kept = await keepUpload(db(), await readUpload(photo()), null, NOW, store);
    expect(kept).toMatchObject({ id: ID, type: "image/jpeg", display: true, thumb: true, createdAt: NOW.toISOString() });
    expect(store.path(ID, "original")).not.toBeNull();
    expect(await keepUpload(db(), await readUpload(photo()), null, new Date(), store)).toEqual(kept);

    const original = await serveFile(new Request(`http://x/api/files/${ID}/original?download`), { id: ID, variant: "original" }, db(), store);
    expect(original.status).toBe(200);
    expect(original.headers.get("content-type")).toBe("image/jpeg");
    expect(original.headers.get("x-content-type-options")).toBe("nosniff");
    expect(original.headers.get("cache-control")).toContain("private");
    expect(original.headers.get("content-disposition")).toMatch(/^attachment; filename="IMG_2041.jpg"/);
    expect(new Uint8Array(await original.arrayBuffer())).toEqual(JPEG);

    const thumb = await serveFile(new Request(`http://x/api/files/${ID}/thumb`), { id: ID, variant: "thumb" }, db(), store);
    expect(thumb.headers.get("content-disposition")).toMatch(/^inline/);
  });

  test("the route answers nothing it doesn't keep", async () => {
    const get = (id: string, variant: string) => serveFile(new Request(`http://x/api/files/${id}/${variant}`), { id, variant }, db(), store);
    expect((await get(ID, "original")).status).toBe(404);
    expect((await get("..", "original")).status).toBe(404);
    await keepUpload(db(), await readUpload(form({ id: ID, original: new File([PDF], "letter.pdf") })), null, NOW, store);
    expect((await get(ID, "secret")).status).toBe(404);
    // A PDF has no thumbnail.
    expect((await get(ID, "thumb")).status).toBe(404);
    expect((await get(ID, "original")).headers.get("content-type")).toBe("application/pdf");
  });

  test("an upload whose record never came is swept as the next one arrives, a day on; one with its record stays", async () => {
    const shown = "22222222-2222-4222-8222-222222222222";
    const lost = "33333333-3333-4333-8333-333333333333";
    const early = new Date("2026-10-27T00:00:00Z");
    await keepUpload(db(), await readUpload(form({ id: shown, original: new File([JPEG], "a.jpg") })), null, early, store);
    await keepUpload(db(), await readUpload(form({ id: lost, original: new File([JPEG], "b.jpg") })), null, early, store);
    new PhotosRepo(db()).add({ id: ID, fileId: shown, kind: "bump", day: "2026-10-27", time: null, caption: null }, null, early);

    await keepUpload(db(), await readUpload(photo()), null, NOW, store);
    const files = new FilesRepo(db());
    expect(files.get(lost)).toBeNull();
    expect(store.has(lost)).toBe(false);
    expect(files.get(shown)).not.toBeNull();
    expect(files.get(ID)).not.toBeNull();
  });

  test("dropped with its record: row and folder", async () => {
    await keepUpload(db(), await readUpload(photo()), null, NOW, store);
    await dropUpload(db(), ID, store);
    expect(new FilesRepo(db()).get(ID)).toBeNull();
    expect(existsSync(join(store.root, ID))).toBe(false);
  });
});
