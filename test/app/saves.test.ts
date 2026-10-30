import { expect, test } from "vitest";
import { SAVES } from "../../src/app/model/saves";
import type { Made } from "../../src/lib/outbox";

// Every save's `apply` gives the same answer run twice: a fetch that already
// includes a save has it applied over it again until the save is through.

const made: Made = { at: "2026-10-30T07:30:00.000Z", by: "00000000-0000-4000-8000-0000000000aa" };
const ID = "11111111-1111-4111-8111-111111111111";

const checklist = { ticks: { "book-rsv-vaccine": "2026-10-01T00:00:00.000Z" }, ownTasks: [{ id: ID, title: "Cot", week: 30, createdAt: made.at }] };
const questions = [{ id: ID, text: "Free?", answer: null, askedAt: null, createdAt: made.at }];
const names = { names: [{ id: ID, name: "Ada", mine: null }], matches: [{ id: ID, name: "Ada" }], together: true };
const settings = { dueDate: "2027-03-01", baby: "surprise", onboardedAt: made.at };
const note = { id: ID, kind: "note", day: "2026-10-30", time: "07:30", body: "First kick!", by: made.by, createdAt: made.at, editedBy: null, editedAt: null };
const journal = [note];
const emergency = { values: { carerPhone: "0400 000 000" }, changed: null };

/** For each save: data as fetched, and inputs to apply over it. */
const CASES: Record<string, [unknown, unknown[]]> = {
  setTicked: [
    checklist,
    [
      { taskId: "book-rsv-vaccine", ticked: true },
      { taskId: "book-rsv-vaccine", ticked: false },
      { taskId: "x", ticked: true },
    ],
  ],
  addOwnTask: [checklist, [{ id: "22222222-2222-4222-8222-222222222222", title: " Pram ", week: 32 }]],
  deleteOwnTask: [checklist, [{ id: ID }]],
  addQuestion: [questions, [{ id: "22222222-2222-4222-8222-222222222222", text: "Scan?" }]],
  markAsked: [
    questions,
    [
      { id: ID, answer: " Yes " },
      { id: ID, answer: "" },
    ],
  ],
  reopenQuestion: [questions, [{ id: ID }]],
  deleteQuestion: [questions, [{ id: ID }]],
  addName: [
    names,
    [
      { id: "22222222-2222-4222-8222-222222222222", name: "iris" },
      { id: "22222222-2222-4222-8222-222222222222", name: "ADA" },
    ],
  ],
  voteName: [names, [{ id: ID, liked: false }]],
  removeName: [names, [{ id: ID }]],
  saveAnswer: [
    [],
    [
      { key: "cover", answer: "private" },
      { key: "cover", answer: null },
    ],
  ],
  setExtras: [[], [[{ id: "baby-shower", on: true }]]],
  saveSettings: [settings, [{ dueDate: "2027-03-08" }, { baby: "boy" }, { dueDate: null }]],
  saveEmergency: [emergency, [{ carerPhone: "", notes: "Allergic to penicillin  " }, { carerPhone: "0400 000 000" }]],
  setQuiet: [null, [{ kind: "news" }, { kind: "loss" }]],
  clearQuiet: [{ kind: "news", setBy: null, setAt: made.at }, [null]],
  addNote: [journal, [{ id: "22222222-2222-4222-8222-222222222222", day: "2026-10-29", time: null, body: " Told Mum " }]],
  editNote: [journal, [{ id: ID, day: "2026-10-29", time: null, body: "First kick, I think " }]],
  restoreNote: [[], [note]],
  deleteNote: [journal, [{ id: ID }]],
};

test("every save has its cases here", () => {
  expect(SAVES.map((s) => s.key).sort()).toEqual(Object.keys(CASES).sort());
});

test.each(SAVES.flatMap((save) => (CASES[save.key]?.[1] ?? []).map((input) => [save.key, input, save] as const)))(
  "%s %j applies once, however often",
  (key, input, save) => {
    const fetched = CASES[key]![0];
    const once = save.apply(structuredClone(fetched), input, made);
    expect(save.apply(structuredClone(once), input, made)).toEqual(once);
    expect(once).not.toBe(undefined);
  }
);

test("a save changes what it says, and nothing it doesn't", () => {
  const byKey = Object.fromEntries(SAVES.map((s) => [s.key, s]));
  expect(byKey.setTicked!.apply(checklist, { taskId: "x", ticked: true }, made).ticks).toEqual({ ...checklist.ticks, x: made.at });
  expect(byKey.deleteOwnTask!.apply({ ...checklist, ticks: { [ID]: made.at } }, { id: ID }, made)).toEqual({ ticks: {}, ownTasks: [] });
  expect(byKey.markAsked!.apply(questions, { id: ID, answer: " Yes " }, made)[0]).toMatchObject({ askedAt: made.at, answer: "Yes" });
  expect(byKey.addName!.apply(names, { id: "22222222-2222-4222-8222-222222222222", name: "ADA" }, made).names).toEqual([{ id: ID, name: "Ada", mine: true }]);
  expect(byKey.saveSettings!.apply(settings, { baby: "boy" }, made)).toEqual({ ...settings, baby: "boy" });
  expect(byKey.saveEmergency!.apply(emergency, { carerPhone: "" }, made)).toEqual({ values: {}, changed: { by: made.by, at: made.at } });
  expect(byKey.addNote!.apply([], { id: ID, day: "2026-10-29", time: null, body: " Told Mum " }, made)).toEqual([
    { id: ID, kind: "note", day: "2026-10-29", time: null, body: "Told Mum", by: made.by, createdAt: made.at, editedBy: null, editedAt: null },
  ]);
  expect(byKey.editNote!.apply(journal, { id: ID, day: "2026-10-29", time: null, body: "Kick " }, made)[0]).toEqual({
    ...note,
    day: "2026-10-29",
    time: null,
    body: "Kick",
    editedBy: made.by,
    editedAt: made.at,
  });
  expect(byKey.setQuiet!.apply({ kind: "loss", setBy: null, setAt: made.at }, { kind: "news" }, made)).toMatchObject({ kind: "loss" });
});
