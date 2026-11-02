// The tools that read: where you are, a week, the to do, the Library, the
// Journal, the questions for appointments, Emergency info and the lists. They
// show what the app shows, tailored by your answers and extras. A private
// entry (family violence, reproductive coercion) is never among them.

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { builtInItems, dayReads, loadPage, weekNotes } from "../../content";
import { readsOut } from "../../content/days";
import type { Item, Task } from "../../content/schema";
import { asText } from "../../content/text";
import { noteFor, SECTIONS, type WeekNote } from "../../content/weeks";
import { AppetiteRepo } from "../../db/models/appetite/repo";
import { EmergencyRepo } from "../../db/models/emergency/repo";
import { FeelingsRepo } from "../../db/models/feelings/repo";
import { FirstsRepo } from "../../db/models/firsts/repo";
import { JournalRepo } from "../../db/models/journal/repo";
import { ListsRepo } from "../../db/models/lists/repo";
import { PapersRepo } from "../../db/models/papers/repo";
import { PhotosRepo } from "../../db/models/photos/repo";
import { QuestionsRepo } from "../../db/models/questions/repo";
import type { Facts } from "../../features/settings/model/facts";
import { EMERGENCY_FIELDS } from "../../lib/emergency";
import { isOwn } from "../../lib/feelings";
import { firstOf } from "../../lib/firsts";
import { search, worthKnowing } from "../../lib/library";
import { listOf, listsOf, sectionsOf, tailorLines } from "../../lib/lists";
import { gestationLabel, positionOn, WEEKS, type Week } from "../../lib/timeline";
import { comingUp, toDoNow, whenToDo } from "../../lib/todo";
import { type Context, type Known, known, nameOf } from "./context";
import { answer, refuse } from "./tools";

const READ = { readOnlyHint: true, openWorldHint: false } as const;
const week = z.number().int().min(WEEKS.first).max(WEEKS.last);

/** A task as Claude reads it: what, whose, its window, and whether it's done. */
function taskOf(task: Task, k: Known) {
  return {
    id: task.id,
    title: task.title,
    who: task.who,
    opens: task.opens,
    due: task.due,
    deadline: task.deadline,
    entry: task.itemId,
    done: k.ticks[task.id] ?? null,
  };
}

/** An entry as a list shows it. */
function entryOf(item: Item) {
  return {
    id: item.id,
    title: item.title,
    type: item.type,
    topic: item.topic,
    ask: item.ask,
    summary: item.summary,
    weeks: item.from === null ? null : [item.from, item.to],
  };
}

function noteText(note: WeekNote, facts: Facts): string {
  const parts = Object.entries(SECTIONS).map(([key, title]) => `## ${title}\n\n${asText(note.sections[key as keyof typeof SECTIONS], facts)}`);
  return [`# Week ${note.week}: ${note.title}`, ...parts].join("\n\n");
}

/** The week a day falls in, given the due date; null without one. */
function weekOf(day: string, k: Known): Week | null {
  return k.dueDate ? positionOn(day as Known["today"], k.dueDate).week : null;
}

export function readTools(server: McpServer, ctx: () => Context) {
  server.registerTool(
    "this_week",
    {
      title: "This week",
      description:
        "Where the pregnancy is today (week and days, as 28+3), the week's note (the baby, her body, for the partner), today's short read, and what to do now, most urgent first. Start here.",
      annotations: READ,
    },
    () => {
      const k = known(ctx());
      if (!k.position)
        return answer({ today: k.today, you: k.me?.name ?? null, dueDate: null, note: "No due date yet: it is set in Expecting's onboarding or Settings." });
      const { week: now, gestationDays } = k.position;
      const note = noteFor(weekNotes, now);
      const read = readsOut(dayReads, now, gestationDays).at(-1);
      return answer({
        today: k.today,
        you: k.me?.name ?? null,
        people: k.people.map((p) => ({ name: p.name, role: p.role })),
        dueDate: k.dueDate,
        week: now,
        gestation: gestationLabel(gestationDays),
        note: note ? noteText(note, k.facts) : null,
        todaysRead: read
          ? { title: read.title, text: asText(read.body, k.facts), entries: read.read.filter((id) => !builtInItems.find((i) => i.id === id)?.private) }
          : null,
        toDoNow: toDoNow(k.tasks, k.ticks, now).map((t) => ({ ...taskOf(t.task, k), when: whenToDo(t, now) })),
      });
    }
  );

  server.registerTool(
    "week",
    {
      title: "A week",
      description: "Any week of the pregnancy, 1–42: its note, the tasks that open or are due in it, and the Library entries that start then.",
      inputSchema: { week },
      annotations: READ,
    },
    ({ week: w }) => {
      const k = known(ctx());
      const note = noteFor(weekNotes, w as Week);
      return answer({
        week: w,
        thisWeek: k.position?.week ?? null,
        note: note ? noteText(note, k.facts) : null,
        tasks: k.tasks.filter((t) => t.opens === w || t.due === w || t.deadline === w).map((t) => taskOf(t, k)),
        worthKnowing: worthKnowing(k.items, w as Week).map(entryOf),
      });
    }
  );

  server.registerTool(
    "tasks",
    {
      title: "To do",
      description:
        "The to do: bookings, claims, purchases and paperwork, each with its window (opens, due = best by, deadline = a hard date) as pregnancy weeks, whose job it is (carrying, partner, together) and when it was done. `now` is what to do now, most urgent first; `coming` the next eight weeks; `all` everything; `done` what's ticked.",
      inputSchema: { show: z.enum(["now", "coming", "all", "done"]).default("now") },
      annotations: READ,
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

  server.registerTool(
    "search_library",
    {
      title: "Search the Library",
      description:
        "Search everything Expecting knows: can-I questions (brie, hair dye, flying), symptoms (is this normal?), decisions, payments and entitlements, moments, guides, and the terms. Every word must match. Read one with read_library.",
      inputSchema: { query: z.string().min(1).max(200), limit: z.number().int().min(1).max(50).default(10) },
      annotations: READ,
    },
    ({ query, limit }) => {
      const k = known(ctx());
      return answer(
        search(
          k.items.filter((i) => !i.private),
          query
        )
          .slice(0, limit)
          .map(entryOf)
      );
    }
  );

  server.registerTool(
    "read_library",
    {
      title: "Read a Library entry",
      description:
        "One Library entry whole, as Markdown, its words fitted to your answers: what it says, its verdict or stakes, the questions it suggests for the next appointment, and its sources. Australian, from its sources; not medical advice.",
      inputSchema: { id: z.string().min(1).max(200) },
      annotations: READ,
    },
    async ({ id }) => {
      const item = builtInItems.find((i) => i.id === id);
      if (!item || item.private) return refuse(`No entry ${id}: search_library finds them.`);
      const k = known(ctx());
      const page = await loadPage(item);
      return answer(
        [
          `# ${item.title}`,
          item.ask ? `*${item.ask}*` : null,
          item.verdict ? `Verdict: ${item.verdict}` : null,
          item.stakes ? `Stakes: ${item.stakes}` : null,
          item.from !== null ? `Weeks ${item.from}–${item.to}` : null,
          item.summary,
          asText(page.doc, k.facts),
          item.tasks.length
            ? `## Tasks\n\n${item.tasks.map((t) => `- ${t.title} (id ${t.id}; weeks ${t.opens}–${t.due}${t.deadline ? `, deadline week ${t.deadline}` : ""}${k.ticks[t.id] ? ", done" : ""})`).join("\n")}`
            : null,
          page.appointment.length ? `## To ask at the next appointment\n\n${page.appointment.map((q) => `- ${q}`).join("\n")}` : null,
          page.sources.length ? `## Sources\n\n${page.sources.map((s) => `- [${s.title}](${s.url})`).join("\n")}` : null,
        ]
          .filter(Boolean)
          .join("\n\n")
      );
    }
  );

  server.registerTool(
    "journal",
    {
      title: "The Journal",
      description:
        "What's been kept, newest first: notes and letters to the baby, movements, sickness and cravings, how each of you is feeling, the firsts, photos and scans, and results and papers. Each says who kept it. Filter by a week or by kinds. Photos and papers are fetched with get_photo and get_paper.",
      inputSchema: {
        week: week.optional(),
        kinds: z.array(z.enum(["note", "letter", "movement", "sick", "craving", "off", "feeling", "first", "photo", "paper"])).optional(),
        limit: z.number().int().min(1).max(200).default(40),
      },
      annotations: READ,
    },
    ({ week: w, kinds, limit }) => {
      const c = ctx();
      const k = known(c);
      const by = (id: string | null) => nameOf(k.people, id);
      const story = [
        ...new JournalRepo(c.db).list().map((e) => ({
          kind: e.kind,
          id: e.id,
          day: e.day,
          time: e.time,
          by: e.fromBoth ? "both" : by(e.by),
          text: e.body || null,
          ...(e.kind === "movement" && e.different ? { different: "slower, weaker or stopped" } : {}),
        })),
        ...new AppetiteRepo(c.db)
          .list()
          .map((e) => ({ kind: e.kind, id: e.id, day: e.day, time: e.time, by: by(e.by), how: e.how, what: e.what, text: e.note })),
        ...new FeelingsRepo(c.db).list(c.personId).map((f) => ({
          kind: "feeling" as const,
          id: f.id,
          day: f.day,
          time: f.time,
          by: by(f.by),
          step: f.step,
          ...(isOwn(f) ? { words: f.words, text: f.note } : {}),
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
          })),
        ...new PhotosRepo(c.db)
          .list()
          .map((p) => ({ kind: "photo" as const, id: p.id, day: p.day, time: p.time, by: by(p.by), photoKind: p.kind, text: p.caption })),
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
        })),
      ]
        .filter((e) => !kinds || kinds.includes(e.kind))
        .map((e) => ({ ...e, week: weekOf(e.day, k) }))
        .filter((e) => w === undefined || e.week === w)
        .sort((a, b) => `${b.day} ${b.time ?? ""}`.localeCompare(`${a.day} ${a.time ?? ""}`))
        .slice(0, limit);
      return answer(story);
    }
  );

  server.registerTool(
    "questions",
    {
      title: "Questions for appointments",
      description: "The questions you're keeping for the next appointment, and those already asked with what you were told.",
      annotations: READ,
    },
    () => {
      const c = ctx();
      const k = known(c);
      return answer(
        new QuestionsRepo(c.db).list().map((q) => ({ id: q.id, text: q.text, entry: q.itemId, by: nameOf(k.people, q.by), asked: q.askedAt, answer: q.answer }))
      );
    }
  );

  server.registerTool(
    "emergency_info",
    {
      title: "Emergency info",
      description:
        "What a hospital or an ambulance will ask, kept ready: her details, this pregnancy, allergies, medicines, the hospital and its numbers, who to call.",
      annotations: READ,
    },
    () => {
      const { values } = new EmergencyRepo(ctx().db).get();
      return answer(Object.fromEntries(EMERGENCY_FIELDS.filter((f) => values[f.id]).map((f) => [f.label, values[f.id]])));
    }
  );

  server.registerTool(
    "lists",
    {
      title: "Lists of what to get",
      description:
        "The lists of what to get (before the birth, the hospital bag, and your own): without a list id, each list and how far along it is; with one, its lines by section, each got, arranged, not needed or still to get.",
      inputSchema: { list: z.string().max(100).optional() },
      annotations: READ,
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
          title: s.title,
          lines: s.lines.map((l) => ({ id: l.id, title: l.title, state: marks[l.id]?.state ?? "to get", note: marks[l.id]?.note ?? null })),
        })),
        notNeeded: notNeeded.map((l) => l.title),
      });
    }
  );
}
