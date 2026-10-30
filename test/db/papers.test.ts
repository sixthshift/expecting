import { expect, test } from "vitest";
import { FilesRepo } from "../../src/db/models/files/repo";
import { PapersRepo } from "../../src/db/models/papers/repo";
import { PeopleRepo } from "../../src/db/models/people/repo";
import type { Upload } from "../../src/lib/files";
import type { PaperInput } from "../../src/lib/papers";
import { useTestDb } from "./helpers";

const db = useTestDb();
const ID = "11111111-1111-4111-8111-111111111111";
const PDF = "22222222-2222-4222-8222-222222222222";
const PAGE_1 = "33333333-3333-4333-8333-333333333333";
const PAGE_2 = "44444444-4444-4444-8444-444444444444";
const NOW = new Date("2026-10-30T00:00:00Z");
const LATER = new Date("2026-10-30T08:00:00Z");

const upload = (id: string, pdf = false, at: Date = NOW): Upload => ({
  id,
  name: pdf ? "GTT results.pdf" : "IMG_2041.jpg",
  type: pdf ? "application/pdf" : "image/jpeg",
  size: pdf ? 120_000 : 2_000_000,
  width: pdf ? null : 3024,
  height: pdf ? null : 4032,
  display: !pdf,
  thumb: !pdf,
  by: null,
  createdAt: at.toISOString(),
});

const input = (fields: Partial<PaperInput> = {}): PaperInput => ({
  id: ID,
  kind: "result",
  title: "  Glucose tolerance test ",
  itemId: "glucose-tolerance-test",
  day: "2026-10-26",
  note: " ",
  handy: false,
  // What the phone says of a page is never believed: its upload says what it is.
  pages: [{ fileId: PDF, type: "image/png", name: "whatever", size: 1 }],
  ...fields,
});

test("a paper keeps its pages in order, each as its upload says, and is kept once however often it's sent", () => {
  const people = new PeopleRepo(db());
  const alex = people.add("Alex", "partner").id;
  const files = new FilesRepo(db());
  files.add(upload(PDF, true));
  const repo = new PapersRepo(db());

  const paper = repo.add(input(), alex, NOW);
  expect(paper).toEqual({
    id: ID,
    kind: "result",
    title: "Glucose tolerance test",
    itemId: "glucose-tolerance-test",
    day: "2026-10-26",
    note: null,
    handy: false,
    pages: [{ fileId: PDF, type: "application/pdf", name: "GTT results.pdf", size: 120_000 }],
    by: alex,
    createdAt: NOW.toISOString(),
    editedBy: null,
    editedAt: null,
  });
  // The same save sent twice is kept once.
  repo.add(input({ title: "Again" }), alex, LATER);
  expect(repo.list()).toEqual([paper]);
});

test("a photographed letter is one paper of several pages, in the order they were added", () => {
  const files = new FilesRepo(db());
  files.add(upload(PAGE_1));
  files.add(upload(PAGE_2));
  const repo = new PapersRepo(db());
  const pages = [PAGE_2, PAGE_1].map((fileId) => ({ fileId, type: "image/jpeg" as const, name: "x.jpg", size: 1 }));
  const paper = repo.add(input({ kind: "letter", title: "Referral", itemId: null, pages }), null, NOW);
  expect(paper.pages.map((p) => p.fileId)).toEqual([PAGE_2, PAGE_1]);
});

test("changed by either of you, never its pages; deleted with its pages, saying which uploads to drop", () => {
  const people = new PeopleRepo(db());
  const sam = people.add("Sam", "carrying").id;
  const files = new FilesRepo(db());
  files.add(upload(PAGE_1));
  files.add(upload(PAGE_2));
  const repo = new PapersRepo(db());
  const pages = [PAGE_1, PAGE_2].map((fileId) => ({ fileId, type: "image/jpeg" as const, name: "x.jpg", size: 1 }));
  const paper = repo.add(input({ pages }), null, NOW);

  repo.edit({ id: ID, kind: "plan", title: " Birth plan ", itemId: "birth-preferences", day: "2026-10-30", note: " Copy to the GP ", handy: true }, sam, LATER);
  expect(repo.get(ID)).toEqual({
    ...paper,
    kind: "plan",
    title: "Birth plan",
    itemId: "birth-preferences",
    day: "2026-10-30",
    note: "Copy to the GP",
    handy: true,
    editedBy: sam,
    editedAt: LATER.toISOString(),
  });

  // Its uploads can't go while its pages point at them.
  expect(() => files.delete(PAGE_1)).toThrow();
  expect(repo.delete(ID).sort()).toEqual([PAGE_1, PAGE_2].sort());
  expect(repo.delete(ID)).toEqual([]);
  expect(repo.list()).toEqual([]);
  // The pages went with it, so the uploads are free to go.
  files.delete(PAGE_1);
  files.delete(PAGE_2);
  expect(files.get(PAGE_1)).toBeNull();
});

test("never a paper without its uploads, a page in two papers, a blank name or a kind it doesn't know", () => {
  const files = new FilesRepo(db());
  files.add(upload(PDF, true));
  const repo = new PapersRepo(db());
  // A page whose upload never arrived: nothing kept, not even the paper.
  expect(() => repo.add(input({ pages: [{ fileId: PAGE_1, type: "image/jpeg", name: "x", size: 1 }] }), null, NOW)).toThrow();
  expect(repo.list()).toEqual([]);
  repo.add(input(), null, NOW);
  expect(() => repo.add(input({ id: "55555555-5555-4555-8555-555555555555" }), null, NOW)).toThrow();
  expect(() => repo.add(input({ id: "66666666-6666-4666-8666-666666666666", title: "  ", pages: [] }), null, NOW)).toThrow();
  expect(() => repo.add(input({ id: "77777777-7777-4777-8777-777777777777", kind: "verdict" as never, pages: [] }), null, NOW)).toThrow();
});

test("the file store's sweep finds a paper's pages itself", () => {
  const files = new FilesRepo(db());
  const dayBefore = new Date(NOW.getTime() - 2 * 86_400_000);
  files.add(upload(PDF, true, dayBefore));
  files.add(upload(PAGE_1, false, dayBefore));
  new PapersRepo(db()).add(input(), null, NOW);
  expect(files.references()).toContainEqual({ table: "paper_page", column: "file_id" });
  expect(files.unclaimed(new Date(NOW.getTime() - 86_400_000))).toEqual([PAGE_1]);
});
