// The Planner's tools: the to do, the appointments and the questions for
// them, and the lists of what to get. Read, and kept: a task ticked or added,
// an appointment kept or changed, a question kept, moved or marked asked, a line
// added or marked. Each kept as the person the connection speaks for.

import { z } from "zod";
import { isBuiltInItemId, isBuiltInLineId, isBuiltInTaskId } from "../../../content";
import { AppointmentsRepo } from "../../../db/models/appointments/repo";
import { ChecklistRepo } from "../../../db/models/checklist/repo";
import { ListsRepo } from "../../../db/models/lists/repo";
import { QuestionsRepo } from "../../../db/models/questions/repo";
import { isISODate, TIME } from "../../../lib/dates";
import { splitAppointments } from "../../../lib/planner/appointments";
import { listOf } from "../../../lib/planner/lists/builtIn";
import { HOWS, type How, type LineState, tailorLines } from "../../../lib/planner/lists/lines";
import { sectionsOf } from "../../../lib/planner/lists/sections";
import { listsOf } from "../../../lib/planner/lists/summaries";
import { sameWords } from "../../../lib/planner/questions";
import { comingUp, toDoNow, whenToDo } from "../../../lib/planner/todo";
import { answer, refuse, type Tools } from "../answer";
import { known } from "../context";
import { taskOf } from "../shapes";
import { week } from "./home";

const day = z.string().refine(isISODate, "A date, YYYY-MM-DD");

/** A line's state as Claude says it, and as it's kept: still to get is no state. */
const STATES = { "to-get": null, arranged: "arranged", got: "got", "not-needed": "not-needed" } as const satisfies Record<string, LineState | null>;

export function plannerTools({ ctx, read, keep }: Tools) {
  read(
    "tasks",
    {
      title: "To do",
      description:
        "The to do: bookings, claims, purchases and paperwork, each with its window as pregnancy weeks (opens, due = best by, deadline = a hard date) and as days (opensOn, dueBy, deadlineOn), whose job it is (carrying, partner, together) and when it was done. `now` is what to do now, most urgent first; `coming` the next eight weeks; `all` everything; `done` what's ticked.",
      inputSchema: { show: z.enum(["now", "coming", "all", "done"]).default("now") },
    },
    ({ show }) => {
      const k = known(ctx());
      const now = k.position?.week ?? null;
      if ((show === "now" || show === "coming") && now === null) return refuse("No due date yet, so there's no now: ask for `all`.");
      if (show === "now") return answer(toDoNow(k.tasks, k.ticks, now!).map((t) => ({ ...taskOf(t.task, k), when: whenToDo(t, now!) })));
      if (show === "coming") return answer(comingUp(k.tasks, k.ticks, now!).map((c) => ({ ...taskOf(c.task, k), week: c.week, isDeadline: c.deadline })));
      return answer(k.tasks.filter((t) => show === "all" || k.ticks[t.id]).map((t) => taskOf(t, k)));
    }
  );

  keep(
    "tick_task",
    {
      title: "Tick off a task",
      description: "Mark a task done (or not done, with done: false), by its id from tasks or this_week. Ticked everywhere it appears.",
      inputSchema: { task: z.string().min(1).max(200), done: z.boolean().default(true) },
    },
    ({ task, done }) => {
      const { db, now } = ctx();
      const repo = new ChecklistRepo(db);
      if (!isBuiltInTaskId(task) && !repo.hasOwnTask(task)) return refuse(`No task ${task}: the tasks tool lists them.`);
      repo.setTicked(task, done, now);
      return answer(done ? "Ticked." : "Unticked.");
    }
  );

  keep(
    "add_task",
    {
      title: "Add a task",
      description: "Add a task of your own to the to do, on a pregnancy week (1–42), when it's best done.",
      inputSchema: { title: z.string().trim().min(1).max(200), week },
    },
    ({ title, week: w }) => {
      const { db, now } = ctx();
      const task = new ChecklistRepo(db).addOwnTask({ title, week: w }, now);
      return answer({ kept: "task", id: task.id });
    }
  );

  read(
    "appointments",
    {
      title: "Appointments",
      description:
        "The appointments kept: what each is, its day (YYYY-MM-DD) and its pregnancy week, its time (HH:MM, if known), where and any notes. `ahead` (today's included, earliest first) or `past` (latest first). The next one is the first ahead. Each question is for one of them (questions).",
      inputSchema: { show: z.enum(["ahead", "past", "all"]).default("ahead") },
    },
    ({ show }) => {
      const c = ctx();
      const k = known(c);
      const { ahead, past } = splitAppointments(new AppointmentsRepo(c.db).list(), k.today);
      const shown = show === "ahead" ? ahead : show === "past" ? past : [...ahead, ...past];
      return answer(
        shown.map((a) => ({ id: a.id, title: a.title, day: a.day, week: k.weekOf(a.day), time: a.time, place: a.place, notes: a.notes, by: k.nameOf(a.by) }))
      );
    }
  );

  const what = z.string().trim().min(1).max(200).describe('What it is: "Midwife", "20-week scan"');
  const time = z.string().regex(TIME, "HH:MM").nullable().describe("Its time, HH:MM, 24-hour; null for none");
  const place = z.string().max(500).nullable().describe("Where; null for nowhere said");
  const notes = z.string().max(10_000).nullable().describe("Anything to remember, before or after; null for none");

  keep(
    "add_appointment",
    {
      title: "Add an appointment",
      description:
        "Keep an appointment: what it is, its day, and its time, place and notes if known. One-off; nothing repeats. Check appointments first, so one already kept (from the app, or by the other parent) isn't kept twice.",
      inputSchema: { title: what, day: day.describe("Its day, YYYY-MM-DD"), time: time.default(null), place: place.default(null), notes: notes.default(null) },
    },
    (input) => {
      const { db, personId, now } = ctx();
      const kept = new AppointmentsRepo(db).add({ id: crypto.randomUUID(), ...input }, personId, now);
      return answer({ kept: "appointment", id: kept.id });
    }
  );

  keep(
    "change_appointment",
    {
      title: "Change an appointment",
      description: "Change an appointment, by its id from appointments: give only what changes (a new day, a time, the place, notes); the rest stays.",
      inputSchema: { id: z.uuid(), title: what.optional(), day: day.optional(), time: time.optional(), place: place.optional(), notes: notes.optional() },
    },
    ({ id, ...changes }) => {
      const { db, personId, now } = ctx();
      const repo = new AppointmentsRepo(db);
      const was = repo.list().find((a) => a.id === id);
      if (!was) return refuse(`No appointment ${id}: the appointments tool lists them.`);
      const next = { id, title: was.title, day: was.day, time: was.time, place: was.place, notes: was.notes };
      for (const [key, value] of Object.entries(changes)) if (value !== undefined) Object.assign(next, { [key]: value });
      repo.edit(next, personId, now);
      return answer({ changed: "appointment", ...next });
    }
  );

  read(
    "questions",
    {
      title: "Questions for appointments",
      description:
        "The questions kept, each for an appointment (its id, title and day; null once that appointment was deleted): those still to ask (`open`), and those asked, with what you were told there (`asked`). An open one at an appointment gone by wasn't asked there, and waits until it's moved. `query` finds those with all its words. Check here before keeping one, so it isn't kept twice.",
      inputSchema: { show: z.enum(["open", "asked", "all"]).default("all"), query: z.string().max(200).optional() },
    },
    ({ show, query }) => {
      const c = ctx();
      const k = known(c);
      const appointments = new Map(new AppointmentsRepo(c.db).list().map((a) => [a.id, a]));
      const words = sameWords(query ?? "")
        .split(" ")
        .filter(Boolean);
      return answer(
        new QuestionsRepo(c.db)
          .list()
          .filter((q) => show === "all" || (show === "asked") === (q.askedAt !== null))
          .filter((q) => words.every((w) => sameWords(`${q.text} ${q.answer ?? ""}`).includes(w)))
          .map((q) => {
            const a = q.appointmentId ? appointments.get(q.appointmentId) : undefined;
            return {
              id: q.id,
              text: q.text,
              entry: q.itemId,
              by: k.nameOf(q.by),
              appointment: a ? { id: a.id, title: a.title, day: a.day } : null,
              asked: q.askedAt,
              answer: q.answer,
            };
          })
      );
    }
  );

  /** The appointment a question goes to: the one named, still ahead; else the next. */
  function aheadOf(appointment: string | undefined): { id: string } | string {
    const c = ctx();
    const { ahead } = splitAppointments(new AppointmentsRepo(c.db).list(), known(c).today);
    if (appointment === undefined)
      return ahead[0] ?? "Nothing's booked: a question is for an appointment, so add it first (add_appointment), then the question to it.";
    return ahead.find((a) => a.id === appointment) ?? `No appointment ${appointment} still ahead: the appointments tool lists them.`;
  }

  keep(
    "add_question",
    {
      title: "Keep a question for an appointment",
      description:
        "Keep a question to ask at an appointment still ahead (its id from appointments; the next one if none is given), optionally about a Library entry (its id). Offer this whenever you'd say to ask the midwife or doctor, and keep it once they say yes. One already open in the same words isn't kept twice.",
      inputSchema: { text: z.string().trim().min(1).max(1000), entry: z.string().max(200).optional(), appointment: z.uuid().optional() },
    },
    ({ text, entry, appointment }) => {
      const { db, personId, now } = ctx();
      if (entry && !isBuiltInItemId(entry)) return refuse(`No entry ${entry}.`);
      const repo = new QuestionsRepo(db);
      const same = repo.list().find((q) => q.askedAt === null && sameWords(q.text) === sameWords(text));
      if (same) return answer({ alreadyKept: "question", id: same.id });
      const to = aheadOf(appointment);
      if (typeof to === "string") return refuse(to);
      const question = repo.add(text, { itemId: entry ?? null, by: personId, appointmentId: to.id }, now);
      return answer({ kept: "question", id: question.id, appointment: to.id });
    }
  );

  keep(
    "move_question",
    {
      title: "Move a question to another appointment",
      description: "Move a question still to ask, by its id from questions, to another appointment still ahead (its id from appointments).",
      inputSchema: { id: z.uuid(), appointment: z.uuid() },
    },
    ({ id, appointment }) => {
      const { db } = ctx();
      const repo = new QuestionsRepo(db);
      const question = repo.list().find((q) => q.id === id);
      if (!question) return refuse(`No question ${id}: the questions tool lists them.`);
      if (question.askedAt !== null) return refuse("That one was asked: keep it again (add_question) to ask it again.");
      const to = aheadOf(appointment);
      if (typeof to === "string") return refuse(to);
      repo.move(id, to.id);
      return answer({ moved: "question", appointment: to.id });
    }
  );

  keep(
    "mark_question_asked",
    {
      title: "Mark a question asked",
      description: "Mark a kept question asked at the appointment it's for, by its id from questions, with what you were told.",
      inputSchema: { id: z.uuid(), answer: z.string().max(5000).default("") },
    },
    ({ id, answer: told }) => {
      const { db, now } = ctx();
      const repo = new QuestionsRepo(db);
      if (!repo.list().some((q) => q.id === id)) return refuse(`No question ${id}: the questions tool lists them.`);
      repo.markAsked(id, told, now);
      return answer("Marked asked.");
    }
  );

  read(
    "lists",
    {
      title: "Lists of what to get",
      description:
        "The lists of what to get (before the birth, freezer meals, the hospital bag, and your own): without a list id, each list and how far along it is; with one, its lines by section (each section's key, for add_line), each to get, arranged, got or not needed.",
      inputSchema: { list: z.string().max(100).optional() },
    },
    ({ list }) => {
      const c = ctx();
      const k = known(c);
      const { ownLists, ownLines, marks } = new ListsRepo(c.db).all();
      const lines = tailorLines(k.items, k.facts, ownLines);
      if (!list) return answer(listsOf(lines, ownLists, marks));
      if (!listOf(list) && !ownLists.some((l) => l.id === list)) return refuse(`No list ${list}: ask without one for them all.`);
      const { sections, notNeeded } = sectionsOf(list, lines, marks);
      return answer({
        sections: sections.map((s) => ({
          key: s.key,
          title: s.title,
          lines: s.lines.map((l) => ({
            id: l.id,
            title: l.title,
            state: marks[l.id]?.state ?? "to-get",
            how: marks[l.id]?.how ?? null,
            note: marks[l.id]?.note ?? null,
          })),
        })),
        notNeeded: notNeeded.map((l) => ({ id: l.id, title: l.title })),
      });
    }
  );

  keep(
    "add_line",
    {
      title: "Add to a list",
      description:
        "Add a line of your own to a list, by the list's id from lists, in one of its sections (its key) if it has them: what to get, pack or make. Check the list first: it may already be there.",
      inputSchema: { list: z.string().min(1).max(100), title: z.string().trim().min(1).max(200), section: z.string().max(100).optional() },
    },
    ({ list, title, section }) => {
      const { db, personId, now } = ctx();
      const repo = new ListsRepo(db);
      const builtIn = listOf(list);
      if (!builtIn && !repo.hasList(list)) return refuse(`No list ${list}: the lists tool lists them.`);
      if (section && !(builtIn && section in builtIn.sections)) return refuse(`No section ${section} on ${list}: the lists tool gives each list's.`);
      const line = repo.addLine({ id: crypto.randomUUID(), listId: list, title, section: section ?? null }, personId, now);
      return answer({ kept: "line", id: line.id });
    }
  );

  keep(
    "mark_line",
    {
      title: "Mark a line on a list",
      description:
        "Say where a line on a list is up to, by its id from lists: got (and how: bought, borrowed, hired, second-hand, given), arranged (someone's bringing it, or set aside), not needed, or to get again. A note replaces the line's note; leave it out to keep it.",
      inputSchema: {
        line: z.string().min(1).max(200),
        state: z.enum(Object.keys(STATES) as [keyof typeof STATES, ...(keyof typeof STATES)[]]),
        how: z.enum(Object.keys(HOWS) as [How, ...How[]]).optional(),
        note: z.string().max(500).optional(),
      },
    },
    ({ line, state, how, note }) => {
      const { db, personId, now } = ctx();
      const repo = new ListsRepo(db);
      if (!isBuiltInLineId(line) && !repo.hasLine(line)) return refuse(`No line ${line}: the lists tool gives each list's lines.`);
      const was = repo.all().marks[line];
      repo.mark(line, { state: STATES[state], how: how ?? null, note: note ?? was?.note ?? null }, personId, now);
      return answer({ marked: line, state });
    }
  );
}
