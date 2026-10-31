import { expect, test } from "vitest";
import { SAVES } from "../../src/app/model/saves";
import type { Made } from "../../src/lib/outbox";

// Every save's `apply` gives the same answer run twice: a fetch that already
// includes a save has it applied over it again until the save is through.

const made: Made = { at: "2026-10-30T07:30:00.000Z", by: "00000000-0000-4000-8000-0000000000aa" };
const ID = "11111111-1111-4111-8111-111111111111";

const checklist = { ticks: { "book-rsv-vaccine": "2026-10-01T00:00:00.000Z" }, ownTasks: [{ id: ID, title: "Cot", week: 30, createdAt: made.at }] };
const questions = [{ id: ID, text: "Free?", answer: null, askedAt: null, itemId: null, by: null, createdAt: made.at }];
const names = { names: [{ id: ID, name: "Ada", mine: null }], matches: [{ id: ID, name: "Ada" }], together: true };
const settings = { dueDate: "2027-03-01", baby: "surprise", onboardedAt: made.at };
const note = {
  id: ID,
  kind: "note",
  day: "2026-10-30",
  time: "07:30",
  body: "First kick!",
  different: false,
  by: made.by,
  createdAt: made.at,
  editedBy: null,
  editedAt: null,
};
const MOVED = "44444444-4444-4444-8444-444444444444";
const movement = {
  id: MOVED,
  kind: "movement",
  day: "2026-10-30",
  time: "21:15",
  body: "",
  different: false,
  by: made.by,
  createdAt: made.at,
  editedBy: null,
  editedAt: null,
};
const journal = [note, movement];
const firsts = [{ key: "first-kick", day: "2026-07-14", by: made.by, createdAt: made.at, words: [{ by: "x", body: "At work", editedAt: made.at }] }];
const own = { id: ID, by: made.by, day: "2026-10-30", time: "21:10", step: "low", words: ["tired"], note: "Long day", createdAt: made.at };
const theirs = {
  id: "33333333-3333-4333-8333-333333333333",
  by: "00000000-0000-4000-8000-0000000000bb",
  day: "2026-10-30",
  time: null,
  step: "good",
  createdAt: made.at,
};
const feelings = [own, theirs];
const SICK = "55555555-5555-4555-8555-555555555555";
const sick = {
  id: SICK,
  kind: "sick",
  day: "2026-10-30",
  time: "03:10",
  how: "vomited",
  what: null,
  note: null,
  by: made.by,
  createdAt: made.at,
  editedBy: null,
  editedAt: null,
};
const craving = { ...sick, id: ID, kind: "craving", how: null, what: "Pickles", time: "23:00" };
const appetite = [sick, craving];
const emergency = { values: { carerPhone: "0400 000 000" }, changed: null };
const SHOT = "66666666-6666-4666-8666-666666666666";
const FILE = "77777777-7777-4777-8777-777777777777";
const scan = {
  id: SHOT,
  fileId: FILE,
  kind: "scan",
  day: "2026-10-30",
  time: "09:40",
  caption: "12-week scan",
  by: made.by,
  createdAt: made.at,
  editedBy: null,
  editedAt: null,
};
const photos = [scan];
const PAPER = "99999999-9999-4999-8999-999999999999";
const page = { fileId: FILE, type: "application/pdf", name: "GTT.pdf", size: 120_000 };
const gtt = {
  id: PAPER,
  kind: "result",
  title: "Glucose tolerance test",
  itemId: "glucose-tolerance-test",
  day: "2026-10-26",
  note: null,
  handy: false,
  pages: [page],
  by: made.by,
  createdAt: made.at,
  editedBy: null,
  editedAt: null,
};
const papers = [gtt];

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
  markJournalSeen: [null, [undefined]],
  markFirst: [
    firsts,
    [
      { key: "first-kick", day: "2026-07-12" },
      { key: "first-scan", day: "2026-05-01" },
    ],
  ],
  setFirstAside: [firsts, [{ key: "first-scan" }, { key: "first-kick" }]],
  unmarkFirst: [firsts, [{ key: "first-kick" }]],
  setFirstWords: [
    firsts,
    [
      { key: "first-kick", body: " On the couch " },
      { key: "first-kick", body: " " },
    ],
  ],
  addMovement: [journal, [{ id: "22222222-2222-4222-8222-222222222222", day: "2026-10-30", time: "21:40", body: " ", different: true }]],
  editMovement: [
    journal,
    [
      { id: MOVED, day: "2026-10-30", time: "21:10", body: " Hiccups ", different: false },
      { id: ID, day: "2026-10-30", time: "21:10", body: "", different: true },
    ],
  ],
  restoreMovement: [[], [movement]],
  deleteMovement: [journal, [{ id: MOVED }]],
  addFeeling: [feelings, [{ id: "22222222-2222-4222-8222-222222222222", day: "2026-10-30", time: null, step: "okay", words: ["calm", "calm"], note: " " }]],
  changeFeeling: [
    feelings,
    [
      { id: ID, day: "2026-10-30", time: "21:10", step: "rough", words: [], note: " Couldn't sleep " },
      { id: theirs.id, day: "2026-10-30", time: null, step: "rough", words: [], note: null },
    ],
  ],
  deleteFeeling: [feelings, [{ id: ID }, { id: theirs.id }]],
  addAppetite: [
    appetite,
    [
      { id: "22222222-2222-4222-8222-222222222222", kind: "sick", day: "2026-10-30", time: "04:00", how: "fluids", what: " x ", note: " " },
      { id: "22222222-2222-4222-8222-222222222222", kind: "off", day: "2026-10-30", time: null, how: "queasy", what: " Coffee ", note: null },
    ],
  ],
  editAppetite: [
    appetite,
    [
      { id: SICK, kind: "sick", day: "2026-10-30", time: "03:00", how: "fluids", what: null, note: " Again " },
      { id: ID, kind: "craving", day: "2026-10-29", time: null, how: null, what: " pickles ", note: null },
    ],
  ],
  restoreAppetite: [[], [sick]],
  deleteAppetite: [appetite, [{ id: SICK }]],
  addPhoto: [
    photos,
    [
      { id: "22222222-2222-4222-8222-222222222222", fileId: "88888888-8888-4888-8888-888888888888", kind: "bump", day: "2026-10-30", time: null, caption: " " },
      { id: SHOT, fileId: FILE, kind: "scan", day: "2026-10-30", time: "09:40", caption: "Again" },
    ],
  ],
  editPhoto: [photos, [{ id: SHOT, kind: "other", day: "2026-10-29", time: null, caption: " The printout " }]],
  deletePhoto: [photos, [{ id: SHOT }, { id: ID }]],
  addPaper: [
    papers,
    [
      {
        id: "22222222-2222-4222-8222-222222222222",
        kind: "plan",
        title: " Birth plan ",
        itemId: "birth-preferences",
        day: "2026-10-30",
        note: " ",
        handy: true,
        pages: [{ fileId: "88888888-8888-4888-8888-888888888888", type: "image/jpeg", name: "IMG_1.jpg", size: 2_000_000 }],
      },
      { id: PAPER, kind: "other", title: "Again", itemId: null, day: "2026-10-30", note: null, handy: false, pages: [page] },
    ],
  ],
  editPaper: [papers, [{ id: PAPER, kind: "result", title: " GTT ", itemId: null, day: "2026-10-27", note: " Copy to the GP ", handy: true }]],
  deletePaper: [papers, [{ id: PAPER }, { id: ID }]],
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
    {
      id: ID,
      kind: "note",
      day: "2026-10-29",
      time: null,
      body: "Told Mum",
      different: false,
      by: made.by,
      createdAt: made.at,
      editedBy: null,
      editedAt: null,
    },
  ]);
  expect(byKey.addMovement!.apply([], { id: ID, day: "2026-10-30", time: "21:40", body: " ", different: true }, made)).toEqual([
    { id: ID, kind: "movement", day: "2026-10-30", time: "21:40", body: "", different: true, by: made.by, createdAt: made.at, editedBy: null, editedAt: null },
  ]);
  // A note and a movement are each changed only as what they are.
  expect(byKey.editMovement!.apply(journal, { id: ID, day: "2026-10-30", time: "21:10", body: "", different: true }, made)).toEqual(journal);
  expect(byKey.editNote!.apply(journal, { id: MOVED, day: "2026-10-29", time: null, body: "Kick" }, made)).toEqual(journal);
  expect(byKey.editNote!.apply(journal, { id: ID, day: "2026-10-29", time: null, body: "Kick " }, made)[0]).toEqual({
    ...note,
    day: "2026-10-29",
    time: null,
    body: "Kick",
    editedBy: made.by,
    editedAt: made.at,
  });
  expect(byKey.addFeeling!.apply([], { id: ID, day: "2026-10-30", time: null, step: "okay", words: ["calm", "calm"], note: " " }, made)).toEqual([
    { id: ID, by: made.by, day: "2026-10-30", time: null, step: "okay", words: ["calm"], note: null, createdAt: made.at },
  ]);
  // The other's feeling is theirs alone: neither changed nor deleted from this phone.
  expect(byKey.changeFeeling!.apply(feelings, { id: theirs.id, day: "2026-10-30", time: null, step: "rough", words: [], note: null }, made)).toEqual(feelings);
  expect(byKey.deleteFeeling!.apply(feelings, { id: theirs.id }, made)).toEqual(feelings);
  expect(byKey.deleteFeeling!.apply(feelings, { id: ID }, made)).toEqual([theirs]);
  // Sickness keeps how bad and no what; a craving keeps what and no how; words trimmed or nothing.
  expect(byKey.addAppetite!.apply([], { id: ID, kind: "sick", day: "2026-10-30", time: "04:00", how: "fluids", what: " x ", note: " " }, made)).toEqual([
    {
      id: ID,
      kind: "sick",
      day: "2026-10-30",
      time: "04:00",
      how: "fluids",
      what: null,
      note: null,
      by: made.by,
      createdAt: made.at,
      editedBy: null,
      editedAt: null,
    },
  ]);
  expect(
    byKey.editAppetite!.apply(appetite, { id: ID, kind: "craving", day: "2026-10-29", time: null, how: "queasy", what: " Olives ", note: null }, made)[1]
  ).toEqual({
    ...craving,
    day: "2026-10-29",
    time: null,
    what: "Olives",
    editedBy: made.by,
    editedAt: made.at,
  });
  expect(byKey.setQuiet!.apply({ kind: "loss", setBy: null, setAt: made.at }, { kind: "news" }, made)).toMatchObject({ kind: "loss" });
  // A photo's words trimmed or none; a change never touches its picture.
  expect(byKey.addPhoto!.apply([], { id: ID, fileId: FILE, kind: "bump", day: "2026-10-30", time: null, caption: "  " }, made)).toEqual([
    { id: ID, fileId: FILE, kind: "bump", day: "2026-10-30", time: null, caption: null, by: made.by, createdAt: made.at, editedBy: null, editedAt: null },
  ]);
  expect(byKey.editPhoto!.apply(photos, { id: SHOT, kind: "other", day: "2026-10-29", time: null, caption: " Printout " }, made)).toEqual([
    { ...scan, kind: "other", day: "2026-10-29", time: null, caption: "Printout", editedBy: made.by, editedAt: made.at },
  ]);
  // A paper's name and words trimmed (none rather than blank); a change never touches its pages.
  expect(
    byKey.addPaper!.apply([], { id: ID, kind: "plan", title: " Birth plan ", itemId: null, day: "2026-10-30", note: " ", handy: true, pages: [page] }, made)
  ).toEqual([
    {
      id: ID,
      kind: "plan",
      title: "Birth plan",
      itemId: null,
      day: "2026-10-30",
      note: null,
      handy: true,
      pages: [page],
      by: made.by,
      createdAt: made.at,
      editedBy: null,
      editedAt: null,
    },
  ]);
  expect(
    byKey.editPaper!.apply(papers, { id: PAPER, kind: "result", title: " GTT ", itemId: null, day: "2026-10-27", note: " Copy to the GP ", handy: true }, made)
  ).toEqual([{ ...gtt, title: "GTT", itemId: null, day: "2026-10-27", note: "Copy to the GP", handy: true, editedBy: made.by, editedAt: made.at }]);
});
