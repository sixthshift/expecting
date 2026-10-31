import { expect, test } from "vitest";
import { SAVES } from "../../src/app/model/saves";
import type { Made } from "../../src/lib/outbox";

// Every save's `apply` gives the same answer run twice: a fetch that already
// includes a save has it applied over it again until the save is through.

const made: Made = { at: "2026-10-30T07:30:00.000Z", by: "00000000-0000-4000-8000-0000000000aa" };
const ID = "11111111-1111-4111-8111-111111111111";

const checklist = { ticks: { "book-rsv-vaccine": "2026-10-01T00:00:00.000Z" }, ownTasks: [{ id: ID, title: "Cot", week: 30, createdAt: made.at }] };
const questions = [{ id: ID, text: "Free?", answer: null, askedAt: null, itemId: null, by: null, createdAt: made.at }];
const names = {
  names: [{ id: ID, name: "Ada", mine: null, deck: false }],
  shortlist: [{ id: ID, name: "Ada", star: false }],
  off: [],
  superliked: null,
  together: true,
};
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
const LIST = "66666666-6666-4666-8666-666666666666";
const lists = {
  ownLists: [{ id: LIST, title: "Bunnings run", by: made.by, createdAt: made.at }],
  ownLines: [{ id: ID, listId: LIST, title: "Hooks", section: null, by: made.by, createdAt: made.at }],
  marks: { [ID]: { lineId: ID, state: "got", how: null, note: null, by: made.by, updatedAt: made.at } },
};

/** For each save: data as fetched, and inputs to apply over it. */
const START = "66666666-6666-4666-8666-666666666666";
const PAIN = "77777777-7777-4777-8777-777777777777";
const contraction = { id: PAIN, startedAt: "2026-10-30T07:20:00.000Z", endedAt: null, note: null, by: made.by };
const underWay = {
  id: START,
  startedAt: "2026-10-30T07:00:00.000Z",
  by: made.by,
  watersAt: null,
  waters: null,
  leftAt: null,
  endedAt: null,
  ended: null,
  contractions: [contraction],
  ticks: ["bag-chargers"],
};
const falseAlarm = { ...underWay, id: "88888888-8888-4888-8888-888888888888", endedAt: "2026-10-28T03:00:00.000Z", ended: "home", contractions: [], ticks: [] };
const itsTime = { starts: [underWay, falseAlarm], lines: [{ id: ID, title: "Heater off", by: made.by, createdAt: made.at }] };
const nothingYet = { starts: [falseAlarm], lines: [] };

const MUM = "55555555-5555-4555-8555-555555555555";
const GIFT = "66666666-6666-4666-8666-666666666666";
const circle = {
  people: [{ id: MUM, name: "Mum", note: null, visit: null, hears: "first", help: null, mealDay: null, by: null, createdAt: made.at }],
  gifts: [{ id: GIFT, personId: MUM, what: "The pram", thankedAt: null, by: null, createdAt: made.at }],
  announcement: null,
};

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
  swipeName: [
    names,
    [
      { id: "33333333-3333-4333-8333-333333333333", name: "Hazel", liked: true },
      { id: "33333333-3333-4333-8333-333333333333", name: "Ada", liked: false },
    ],
  ],
  unvoteName: [names, [{ name: "ADA" }, { name: "Nobody" }]],
  superlikeName: [
    names,
    [
      { id: "33333333-3333-4333-8333-333333333333", name: "Hazel", day: "2026-11-01" },
      { id: ID, name: "Ada", day: "2026-11-01" },
    ],
  ],
  takeOffName: [names, [{ id: ID }, { id: "33333333-3333-4333-8333-333333333333" }]],
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
  addList: [
    lists,
    [
      { id: "22222222-2222-4222-8222-222222222222", title: " Ask Mum " },
      { id: LIST, title: "Again" },
    ],
  ],
  renameList: [lists, [{ id: LIST, title: " Hardware " }]],
  deleteList: [lists, [{ id: LIST }]],
  addLine: [
    lists,
    [
      { id: "22222222-2222-4222-8222-222222222222", listId: "baby", title: " Bouncer ", section: null },
      { id: ID, listId: LIST, title: "Again", section: null },
    ],
  ],
  changeLine: [lists, [{ id: ID, title: " Wall hooks ", section: null }]],
  deleteLine: [lists, [{ id: ID }]],
  markLine: [
    lists,
    [
      { lineId: "get-car-seat", state: "arranged", how: "bought", note: " Mum's lending hers " },
      { lineId: ID, state: null, how: null, note: " " },
      { lineId: ID, state: "got", how: "second-hand", note: null },
    ],
  ],
  beginStart: [
    nothingYet,
    [
      { id: START, waters: true },
      { id: START, waters: false },
    ],
  ],
  setWaters: [
    itsTime,
    [
      { startId: START, waters: null },
      { startId: START, waters: "green-brown-blood" },
    ],
  ],
  leaveStart: [itsTime, [{ startId: START }]],
  endStart: [
    itsTime,
    [
      { startId: START, ended: "there" },
      { startId: START, ended: "home" },
    ],
  ],
  deleteStart: [itsTime, [{ id: START }]],
  beginContraction: [
    itsTime,
    [
      { id: "99999999-9999-4999-8999-999999999999", startId: START },
      { id: "99999999-9999-4999-8999-999999999999", startId: ID },
    ],
  ],
  endContraction: [
    itsTime,
    [
      { id: PAIN, startId: START, startedAt: contraction.startedAt },
      { id: ID, startId: START, startedAt: "2026-10-30T07:25:00.000Z" },
    ],
  ],
  noteContraction: [
    itsTime,
    [
      { id: PAIN, note: " Had to stop " },
      { id: PAIN, note: "" },
    ],
  ],
  deleteContraction: [itsTime, [{ id: PAIN }]],
  tickStart: [
    itsTime,
    [
      { startId: START, key: "bag-cash", ticked: true },
      { startId: START, key: "bag-chargers", ticked: false },
    ],
  ],
  addStartLine: [itsTime, [{ id: "22222222-2222-4222-8222-222222222222", title: " Feed the cat " }]],
  deleteStartLine: [itsTime, [{ id: ID }]],
  addCirclePerson: [
    circle,
    [
      { id: ID, name: " Priya ", note: " Sam's sister " },
      { id: MUM, name: "Again", note: null },
    ],
  ],
  renameCirclePerson: [circle, [{ id: MUM, name: " Mum (Jo) ", note: " " }]],
  setCirclePerson: [
    circle,
    [
      { id: MUM, patch: { visit: "hospital", hears: null } },
      { id: MUM, patch: { help: " the school run ", mealDay: "2027-02-03" } },
    ],
  ],
  deleteCirclePerson: [circle, [{ id: MUM }, { id: ID }]],
  addGift: [
    circle,
    [
      { id: ID, personId: MUM, what: " A blanket " },
      { id: GIFT, personId: MUM, what: "Again" },
      { id: ID, personId: "77777777-7777-4777-8777-777777777777", what: "From nobody here" },
    ],
  ],
  thankGift: [
    circle,
    [
      { id: GIFT, thanked: true },
      { id: GIFT, thanked: false },
    ],
  ],
  deleteGift: [circle, [{ id: GIFT }]],
  setAnnouncement: [circle, [{ body: " She's here! " }, { body: " " }]],
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
  expect(byKey.addName!.apply(names, { id: "22222222-2222-4222-8222-222222222222", name: "ADA" }, made).names).toEqual([
    { id: ID, name: "Ada", mine: true, deck: false },
  ]);
  expect(byKey.swipeName!.apply(names, { id: "33333333-3333-4333-8333-333333333333", name: "Hazel", liked: false }, made).names).toEqual([
    { id: ID, name: "Ada", mine: null, deck: false },
    { id: "33333333-3333-4333-8333-333333333333", name: "Hazel", mine: false, deck: true },
  ]);
  expect(byKey.unvoteName!.apply({ ...names, names: [{ ...names.names[0]!, mine: true }] }, { name: "ada" }, made).names).toEqual(names.names);
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

test("It's time's saves land on the start under way, and keep the first time", () => {
  const byKey = Object.fromEntries(SAVES.map((s) => [s.key, s]));
  // A start opened with the waters keeps their time; one opened while another is under way is that one.
  const begun = byKey.beginStart!.apply(nothingYet, { id: START, waters: true }, made);
  expect(begun.starts[0]).toMatchObject({ id: START, startedAt: made.at, watersAt: made.at, waters: null, by: made.by });
  expect(byKey.beginStart!.apply(itsTime, { id: ID, waters: false }, made)).toEqual(itsTime);
  // The waters' colour can change; the time they broke can't.
  const later = { ...made, at: "2026-10-30T08:00:00.000Z" };
  const coloured = byKey.setWaters!.apply(byKey.setWaters!.apply(itsTime, { startId: START, waters: null }, made), { startId: START, waters: "clear" }, later);
  expect(coloured.starts[0]).toMatchObject({ watersAt: made.at, waters: "clear" });
  // A new contraction ends the one still going.
  const next = byKey.beginContraction!.apply(itsTime, { id: ID, startId: START }, later);
  expect(next.starts[0].contractions).toEqual([
    { ...contraction, endedAt: later.at },
    { id: ID, startedAt: later.at, endedAt: null, note: null, by: made.by },
  ]);
  // Ending a start ends what's being timed; the false alarm before it is untouched.
  const ended = byKey.endStart!.apply(itsTime, { startId: START, ended: "there" }, later);
  expect(ended.starts[0]).toMatchObject({ ended: "there", endedAt: later.at, contractions: [{ ...contraction, endedAt: later.at }] });
  expect(ended.starts[1]).toEqual(falseAlarm);
  // A start that has ended takes nothing more.
  expect(byKey.tickStart!.apply(nothingYet, { startId: falseAlarm.id, key: "bag-cash", ticked: true }, made)).toEqual(nothingYet);
  // Out of order: an end before its beginning keeps both, and a save before its start opens it.
  const early = byKey.endContraction!.apply(nothingYet, { id: ID, startId: START, startedAt: "2026-10-30T07:20:00.000Z" }, made);
  expect(early.starts[0]).toMatchObject({ id: START, startedAt: "2026-10-30T07:20:00.000Z" });
  expect(early.starts[0].contractions).toEqual([{ id: ID, startedAt: "2026-10-30T07:20:00.000Z", endedAt: made.at, note: null, by: null }]);
  expect(byKey.beginContraction!.apply(early, { id: ID, startId: START }, { ...made, at: "2026-10-30T07:20:00.000Z" })).toEqual(early);
  // An own line taken off takes its ticks with it.
  expect(byKey.deleteStartLine!.apply({ ...itsTime, starts: [{ ...underWay, ticks: [ID] }] }, { id: ID }, made)).toEqual({
    starts: [{ ...underWay, ticks: [] }],
    lines: [],
  });
});
