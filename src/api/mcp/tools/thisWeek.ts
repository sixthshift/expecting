// This week's tools: where you are, any week, and who you are (the answers
// and the extras on), which every other answer is tailored by.

import { z } from "zod";
import { EXTRAS } from "../../../app/features/settings/model/extras";
import { ASKS, askedOf, type Facts } from "../../../app/features/settings/model/facts";
import { builtInItems, dayReads, weekNotes } from "../../../content";
import { readsOut } from "../../../content/days";
import { asText } from "../../../content/text";
import { noteFor, SECTIONS, type WeekNote } from "../../../content/weeks";
import { worthKnowing } from "../../../lib/library/thisWeek";
import { toDoNow, whenToDo } from "../../../lib/planner/todo";
import { gestationLabel, WEEKS, type Week, weekDates } from "../../../lib/timeline";
import { answer, type Tools } from "../answer";
import { known } from "../context";
import { entryOf, taskOf } from "../shapes";

export const week = z.number().int().min(WEEKS.first).max(WEEKS.last);

function noteText(note: WeekNote, facts: Facts): string {
  const parts = Object.entries(SECTIONS).map(([key, title]) => `## ${title}\n\n${asText(note.sections[key as keyof typeof SECTIONS], facts)}`);
  return [`# Week ${note.week}: ${note.title}`, ...parts].join("\n\n");
}

export function thisWeekTools({ ctx, read }: Tools) {
  read(
    "this_week",
    {
      title: "This week",
      description:
        "Where the pregnancy is today (week and days, as 28+3), the week's note (the baby, her body, for the partner), today's short read, and what to do now, most urgent first. Start here.",
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

  read(
    "week",
    {
      title: "A week",
      description:
        "Any week of the pregnancy, 1–42: its days, its note, the tasks that open or are due in it, and the Library entries that start then. For planning ahead: a trip, a busy fortnight.",
      inputSchema: { week },
    },
    ({ week: w }) => {
      const k = known(ctx());
      const note = noteFor(weekNotes, w as Week);
      return answer({
        week: w,
        days: weekDates(w as Week, k.dueDate),
        thisWeek: k.position?.week ?? null,
        note: note ? noteText(note, k.facts) : null,
        tasks: k.tasks.filter((t) => t.opens === w || t.due === w || t.deadline === w).map((t) => taskOf(t, k)),
        worthKnowing: worthKnowing(k.items, w as Week).map(entryOf),
      });
    }
  );

  read(
    "about_us",
    {
      title: "About us",
      description:
        "Who the two of you are and what you've told Expecting: each of you and your role, the due date, the answers (first baby, how many, public or private care, work and leave, …) and the extras you've turned on. Everything Expecting shows is tailored by these; read them before advice that depends on your situation. They're changed in the app's Settings, not here.",
    },
    () => {
      const k = known(ctx());
      return answer({
        people: k.people.map((p) => ({ name: p.name, role: p.role, you: p.id === k.me?.id })),
        dueDate: k.dueDate,
        answers: ASKS.filter((a) => k.facts[a.key] !== undefined).map((a) => {
          const value = k.facts[a.key]!;
          return { question: askedOf(a, k.people), answer: a.question.answers?.[value] ?? value };
        }),
        extras: EXTRAS.filter((e) => k.extras.has(e.id)).map((e) => ({ name: e.name, what: e.pitch })),
      });
    }
  );
}
