// The Journal's tools: the story, found by week, days, kinds or words; what's
// new since a day, across the Journal and the Planner; a paper's pages; and
// keeping what the "+" keeps. Each kept as the person the connection speaks
// for, stamped now.

import { z } from "zod";
import { AppetiteRepo } from "../../../db/models/appetite/repo";
import { AppointmentsRepo } from "../../../db/models/appointments/repo";
import { FeelingsRepo } from "../../../db/models/feelings/repo";
import { FilesRepo } from "../../../db/models/files/repo";
import { FirstsRepo } from "../../../db/models/firsts/repo";
import { JournalRepo } from "../../../db/models/journal/repo";
import { ListsRepo } from "../../../db/models/lists/repo";
import { PapersRepo } from "../../../db/models/papers/repo";
import { PhotosRepo } from "../../../db/models/photos/repo";
import { QuestionsRepo } from "../../../db/models/questions/repo";
import { addDays, type ISODate, isISODate, todayISO } from "../../../lib/dates";
import { isImage, MADE_TYPE } from "../../../lib/files";
import { HOWS } from "../../../lib/journal/appetite";
import { isOwn, STEPS, WORDS } from "../../../lib/journal/feelings";
import { FIRST_KEYS, firstOf } from "../../../lib/journal/firsts";
import { TIME } from "../../../lib/journal/journal";
import { FileStore } from "../../../server/files/store";
import { answer, refuse, type Tools } from "../answer";
import { type Context, type Known, known, startOf } from "../context";
import { week } from "./home";

const KINDS = ["note", "letter", "movement", "sick", "craving", "off", "feeling", "first", "photo", "paper"] as const;

const isoDay = z.string().refine(isISODate, "A date, YYYY-MM-DD");
const day = isoDay.optional().describe("The day it happened, YYYY-MM-DD; today if left out");
const time = z.string().regex(TIME, "HH:MM").optional().describe("When, HH:MM, 24-hour");

/** HH:MM now, on the house's clock. */
function timeNow(now: Date): string {
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

/** The later of two moments, either perhaps missing. */
function later(a: string, b: string | null | undefined): string {
  return b && b > a ? b : a;
}

/** Everything in the Journal's story, each with who kept it, its week, and when it was kept or last changed (`keptAt`). */
function storyOf(c: Context, k: Known) {
  const by = (id: string | null) => k.nameOf(id);
  return [
    ...new JournalRepo(c.db).list().map((e) => ({
      kind: e.kind,
      id: e.id,
      day: e.day,
      time: e.time,
      by: e.fromBoth ? "both" : by(e.by),
      text: e.body || null,
      ...(e.kind === "movement" && e.different ? { different: "slower, weaker or stopped" } : {}),
      keptAt: later(e.createdAt, e.editedAt),
    })),
    ...new AppetiteRepo(c.db).list().map((e) => ({
      kind: e.kind,
      id: e.id,
      day: e.day,
      time: e.time,
      by: by(e.by),
      how: e.how,
      what: e.what,
      text: e.note,
      keptAt: later(e.createdAt, e.editedAt),
    })),
    ...new FeelingsRepo(c.db).list(c.personId).map((f) => ({
      kind: "feeling" as const,
      id: f.id,
      day: f.day,
      time: f.time,
      by: by(f.by),
      step: f.step,
      ...(isOwn(f) ? { words: f.words, text: f.note } : {}),
      keptAt: f.createdAt,
    })),
    ...new FirstsRepo(c.db)
      .list()
      .filter((f) => f.day)
      .map((f) => ({
        kind: "first" as const,
        id: f.key,
        day: f.day!,
        time: null,
        by: by(f.by),
        title: firstOf(f.key).title,
        words: f.words.map((w) => ({ by: by(w.by), text: w.body })),
        keptAt: f.words.reduce((at, w) => later(at, w.editedAt), f.createdAt),
      })),
    ...new PhotosRepo(c.db).list().map((p) => ({
      kind: "photo" as const,
      id: p.id,
      day: p.day,
      time: p.time,
      by: by(p.by),
      photoKind: p.kind,
      text: p.caption,
      keptAt: later(p.createdAt, p.editedAt),
    })),
    ...new PapersRepo(c.db).list().map((p) => ({
      kind: "paper" as const,
      id: p.id,
      day: p.day,
      time: null,
      by: by(p.by),
      paperKind: p.kind,
      title: p.title,
      text: p.note,
      entry: p.itemId,
      pages: p.pages.length,
      keptAt: later(p.createdAt, p.editedAt),
    })),
  ].map((e) => ({ ...e, week: k.weekOf(e.day) }));
}

/** Newest first, by the day and time it happened. */
function newestFirst<T extends { day: string; time: string | null }>(entries: T[]): T[] {
  return entries.sort((a, b) => `${b.day} ${b.time ?? ""}`.localeCompare(`${a.day} ${a.time ?? ""}`));
}

/** The words in a value, its fields' values and not their names. */
function textOf(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return Object.values(value).map(textOf).join(" ");
  return "";
}

/** Every word of a query somewhere in what an entry says. */
function says(entry: object, words: readonly string[]): boolean {
  const text = textOf(entry).toLowerCase();
  return words.every((w) => text.includes(w));
}

export function journalTools({ ctx, read, keep }: Tools) {
  read(
    "journal",
    {
      title: "The Journal",
      description:
        "What's been kept, newest first: notes and letters to the baby, movements, sickness and cravings, how each of you is feeling, the firsts, photos and scans (their captions), and results and papers. Each says who kept it. Find by a week, by days (from, to: YYYY-MM-DD, by the day it happened), by kinds, or by words (`query`: every word must be there). A paper's pages are fetched with get_paper.",
      inputSchema: {
        week: week.optional(),
        from: isoDay.optional(),
        to: isoDay.optional(),
        kinds: z.array(z.enum(KINDS)).optional(),
        query: z.string().max(200).optional(),
        limit: z.number().int().min(1).max(200).default(40),
      },
    },
    ({ week: w, from, to, kinds, query, limit }) => {
      const c = ctx();
      const words = (query ?? "").toLowerCase().split(/\s+/).filter(Boolean);
      const story = storyOf(c, known(c))
        .filter((e) => !kinds || kinds.includes(e.kind))
        .filter((e) => w === undefined || e.week === w)
        .filter((e) => (!from || e.day >= from) && (!to || e.day <= to))
        .filter((e) => says(e, words))
        .map(({ keptAt: _, ...e }) => e);
      return answer(newestFirst(story).slice(0, limit));
    }
  );

  read(
    "whats_new",
    {
      title: "What's new",
      description:
        "Everything kept or changed since a day, by either of you: the Journal's entries, questions kept or asked, tasks ticked, appointments kept or changed, and lines marked on the lists. For catching up (\"what's she logged this week?\"), a weekly round-up for the partner, or before an appointment. `since` is a day, YYYY-MM-DD; a week ago if left out.",
      inputSchema: { since: isoDay.optional() },
    },
    ({ since }) => {
      const c = ctx();
      const k = known(c);
      const from = (since ?? addDays(todayISO(c.now), -7)) as ISODate;
      const at = startOf(from);
      const tasks = new Map(k.tasks.map((t) => [t.id, t.title]));
      const { marks } = new ListsRepo(c.db).all();
      return answer({
        since: from,
        journal: newestFirst(storyOf(c, k).filter((e) => e.keptAt >= at)).map(({ keptAt: _, ...e }) => e),
        questions: new QuestionsRepo(c.db)
          .list()
          .filter((q) => q.createdAt >= at || (q.askedAt !== null && q.askedAt >= at))
          .map((q) => ({ id: q.id, text: q.text, by: k.nameOf(q.by), appointment: q.appointmentId, asked: q.askedAt, answer: q.answer })),
        ticked: Object.entries(k.ticks)
          .filter(([, when]) => when >= at)
          .map(([id, when]) => ({ id, title: tasks.get(id) ?? id, done: when })),
        appointments: new AppointmentsRepo(c.db)
          .list()
          .filter((a) => later(a.createdAt, a.editedAt) >= at)
          .map((a) => ({ id: a.id, title: a.title, day: a.day, time: a.time, place: a.place, by: k.nameOf(a.editedBy ?? a.by) })),
        lines: Object.values(marks)
          .filter((m) => m.updatedAt >= at)
          .map((m) => ({ line: m.lineId, state: m.state ?? "to-get", how: m.how, note: m.note, by: k.nameOf(m.by) })),
      });
    }
  );

  read(
    "get_paper",
    {
      title: "Look at a result or paper",
      description:
        "A result, letter or other paper from the Journal, by its id (from journal): its pages, as images or a PDF. Describe what's written if asked, but never call a value normal or not: that is for the midwife or doctor who ordered it.",
      inputSchema: { id: z.uuid() },
    },
    async ({ id }) => {
      const c = ctx();
      const paper = new PapersRepo(c.db).get(id);
      if (!paper) return refuse(`No paper ${id}.`);
      const parts = (await Promise.all(paper.pages.map((p) => pageOf(c, p.fileId)))).filter((p) => p !== null);
      return { content: [{ type: "text", text: [paper.title, paper.kind, paper.day, paper.note].filter(Boolean).join(" · ") }, ...parts] };
    }
  );

  keep(
    "add_note",
    {
      title: "Keep a note or a letter",
      description: "Keep a note in the Journal, or a letter to the baby (kind: letter; fromBoth for one from both of you).",
      inputSchema: {
        text: z.string().trim().min(1).max(10_000),
        kind: z.enum(["note", "letter"]).default("note"),
        fromBoth: z.boolean().default(false),
        day,
        time,
      },
    },
    ({ text, kind, fromBoth, day: d, time: t }) => {
      const { db, personId, now } = ctx();
      const entry = new JournalRepo(db).add(
        { id: crypto.randomUUID(), day: d ?? todayISO(now), time: t ?? null, body: text, kind, fromBoth: kind === "letter" && fromBoth },
        personId,
        now
      );
      return answer({ kept: kind, id: entry.id });
    }
  );

  keep(
    "log_movement",
    {
      title: "Log a movement",
      description:
        "Log the baby moving, with a few words if wanted. different: true when it felt slower, weaker or stopped; if so, say plainly to call the hospital's birth suite now, not to wait.",
      inputSchema: { text: z.string().trim().max(10_000).default(""), different: z.boolean().default(false), day, time },
    },
    ({ text, different, day: d, time: t }) => {
      const { db, personId, now } = ctx();
      const entry = new JournalRepo(db).addMovement(
        { id: crypto.randomUUID(), day: d ?? todayISO(now), time: t ?? timeNow(now), body: text, different },
        personId,
        now
      );
      return answer({ kept: "movement", id: entry.id });
    }
  );

  keep(
    "log_sickness",
    {
      title: "Log being sick",
      description: "Log morning sickness: queasy, vomited (threw up), or fluids (can't keep fluids down, which is a call to the GP or hospital today).",
      inputSchema: { how: z.enum(HOWS), note: z.string().trim().max(10_000).optional(), day, time },
    },
    ({ how, note, day: d, time: t }) => {
      const { db, personId, now } = ctx();
      const entry = new AppetiteRepo(db).add(
        { id: crypto.randomUUID(), kind: "sick", day: d ?? todayISO(now), time: t ?? null, how, what: null, note: note || null },
        personId,
        now
      );
      return answer({ kept: "sickness", id: entry.id });
    }
  );

  keep(
    "log_craving",
    {
      title: "Log a craving",
      description: "Log a craving, or something gone off (goneOff: true): what it was.",
      inputSchema: { what: z.string().trim().min(1).max(200), goneOff: z.boolean().default(false), note: z.string().trim().max(10_000).optional(), day, time },
    },
    ({ what, goneOff, note, day: d, time: t }) => {
      const { db, personId, now } = ctx();
      const entry = new AppetiteRepo(db).add(
        { id: crypto.randomUUID(), kind: goneOff ? "off" : "craving", day: d ?? todayISO(now), time: t ?? null, how: null, what, note: note || null },
        personId,
        now
      );
      return answer({ kept: goneOff ? "gone off" : "craving", id: entry.id });
    }
  );

  keep(
    "log_feeling",
    {
      title: "Keep how you're feeling",
      description:
        "Keep how the person connected is feeling: a step (rough, low, okay, good, great), and words if wanted. The step is shared with the other parent; the words and note only ever with this person.",
      inputSchema: {
        step: z.enum(STEPS),
        words: z.array(z.enum(WORDS)).max(WORDS.length).default([]),
        note: z.string().trim().max(10_000).optional(),
        day,
        time,
      },
    },
    ({ step, words, note, day: d, time: t }) => {
      const { db, personId, now } = ctx();
      const feeling = new FeelingsRepo(db).add(
        { id: crypto.randomUUID(), day: d ?? todayISO(now), time: t ?? null, step, words: [...new Set(words)], note: note || null },
        personId,
        now
      );
      return answer({ kept: "feeling", id: feeling.id });
    }
  );

  keep(
    "mark_first",
    {
      title: "Mark a first",
      description: `Mark one of the firsts on its day: ${FIRST_KEYS.join(", ")}.`,
      inputSchema: { first: z.enum(FIRST_KEYS), day },
    },
    ({ first, day: d }) => {
      const { db, personId, now } = ctx();
      new FirstsRepo(db).mark(first, d ?? todayISO(now), personId, now);
      return answer({ kept: "first", id: first });
    }
  );
}

/** A paper's page as something Claude can look at: a picture's display copy, or a PDF; null when its bytes are gone. */
async function pageOf(ctx: Context, fileId: string) {
  const row = new FilesRepo(ctx.db).get(fileId);
  if (!row) return null;
  const store = new FileStore();
  if (isImage(row.type)) {
    const display = store.path(fileId, "display");
    const path = display ?? store.path(fileId, "original");
    if (!path) return null;
    return { type: "image" as const, data: Buffer.from(await Bun.file(path).arrayBuffer()).toString("base64"), mimeType: display ? MADE_TYPE : row.type };
  }
  const path = store.path(fileId, "original");
  if (!path) return null;
  return {
    type: "resource" as const,
    resource: { uri: `expecting:/files/${fileId}`, mimeType: row.type, blob: Buffer.from(await Bun.file(path).arrayBuffer()).toString("base64") },
  };
}
