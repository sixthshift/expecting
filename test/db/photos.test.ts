import { expect, test } from "vitest";
import { FilesRepo } from "../../src/db/models/files/repo";
import { PeopleRepo } from "../../src/db/models/people/repo";
import { PhotosRepo } from "../../src/db/models/photos/repo";
import type { Upload } from "../../src/lib/files";
import { useTestDb } from "./helpers";

const db = useTestDb();
const ID = "11111111-1111-4111-8111-111111111111";
const FILE = "22222222-2222-4222-8222-222222222222";
const NOW = new Date("2026-10-30T00:00:00Z");
const LATER = new Date("2026-10-30T08:00:00Z");

const upload = (id: string, at: Date = NOW): Upload => ({
  id,
  name: "IMG_2041.jpg",
  type: "image/jpeg",
  size: 2_000_000,
  width: 3024,
  height: 4032,
  display: true,
  thumb: true,
  by: null,
  createdAt: at.toISOString(),
});

test("an upload is kept once, however often it's sent, and says what it is", () => {
  const files = new FilesRepo(db());
  const row = files.add(upload(FILE));
  expect(row).toEqual(upload(FILE));
  files.add({ ...upload(FILE), name: "other.jpg" });
  expect(files.get(FILE)?.name).toBe("IMG_2041.jpg");
  expect(() => files.add({ ...upload("33333333-3333-4333-8333-333333333333"), type: "image/svg+xml" as never })).toThrow();
  expect(() => files.add({ ...upload("44444444-4444-4444-8444-444444444444"), size: 0 })).toThrow();
});

test("a photo shows one upload, is shared and changed by either of you, and holds its upload while it's here", () => {
  const people = new PeopleRepo(db());
  const sam = people.add("Sam", "carrying").id;
  const alex = people.add("Alex", "partner").id;
  const files = new FilesRepo(db());
  files.add(upload(FILE));
  const repo = new PhotosRepo(db());

  const photo = repo.add({ id: ID, fileId: FILE, kind: "scan", day: "2026-10-30", time: "09:40", caption: "  12-week scan " }, alex, NOW);
  expect(photo).toEqual({
    id: ID,
    fileId: FILE,
    kind: "scan",
    day: "2026-10-30",
    time: "09:40",
    caption: "12-week scan",
    by: alex,
    createdAt: NOW.toISOString(),
    editedBy: null,
    editedAt: null,
  });
  // The same save sent twice is kept once.
  repo.add({ id: ID, fileId: FILE, kind: "bump", day: "2026-10-30", time: null, caption: null }, alex, NOW);
  expect(repo.list()).toEqual([photo]);

  repo.edit({ id: ID, kind: "other", day: "2026-10-29", time: null, caption: " " }, sam, LATER);
  expect(repo.list()).toEqual([{ ...photo, kind: "other", day: "2026-10-29", time: null, caption: null, editedBy: sam, editedAt: LATER.toISOString() }]);

  // Its upload can't go while the photo points at it.
  expect(() => files.delete(FILE)).toThrow();
  // One upload, one photo.
  repo.add({ id: "55555555-5555-4555-8555-555555555555", fileId: FILE, kind: "bump", day: "2026-10-30", time: null, caption: null }, sam, NOW);
  expect(repo.list()).toHaveLength(1);
  // Nor a photo of an upload that never arrived.
  expect(() =>
    repo.add(
      {
        id: "66666666-6666-4666-8666-666666666666",
        fileId: "77777777-7777-4777-8777-777777777777",
        kind: "bump",
        day: "2026-10-30",
        time: null,
        caption: null,
      },
      sam
    )
  ).toThrow();

  expect(repo.delete(ID)).toBe(FILE);
  expect(repo.delete(ID)).toBeNull();
  files.delete(FILE);
  expect(files.get(FILE)).toBeNull();
});

test("an upload no record points to, a day after it arrived, is unclaimed; one a photo shows never is", () => {
  const files = new FilesRepo(db());
  const shown = "88888888-8888-4888-8888-888888888888";
  const orphan = "99999999-9999-4999-8999-999999999999";
  const fresh = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const dayBefore = new Date(NOW.getTime() - 2 * 86_400_000);
  files.add(upload(shown, dayBefore));
  files.add(upload(orphan, dayBefore));
  files.add(upload(fresh, NOW));
  new PhotosRepo(db()).add({ id: ID, fileId: shown, kind: "bump", day: "2026-10-28", time: null, caption: null }, null, NOW);

  expect(files.references()).toContainEqual({ table: "photo", column: "file_id" });
  expect(files.unclaimed(new Date(NOW.getTime() - 86_400_000))).toEqual([orphan]);
});
