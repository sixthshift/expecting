// Taking back something kept: how an assistant puts right what it got wrong
// (the wrong day, kept twice) by removing it and keeping it again, and how an
// appointment is cancelled. Anything either of you kept from the Journal or
// the Planner, but never the other's feeling, and never a photo or a paper,
// which only the app adds and takes away. Answers with what it was, so it
// can be kept again as it should be.

import { z } from "zod";
import { AppetiteRepo } from "../../../db/models/appetite/repo";
import { AppointmentsRepo } from "../../../db/models/appointments/repo";
import { ChecklistRepo } from "../../../db/models/checklist/repo";
import { FeelingsRepo } from "../../../db/models/feelings/repo";
import { FirstsRepo } from "../../../db/models/firsts/repo";
import { JournalRepo } from "../../../db/models/journal/repo";
import { ListsRepo } from "../../../db/models/lists/repo";
import { QuestionsRepo } from "../../../db/models/questions/repo";
import { isOwn } from "../../../lib/journal/feelings";
import { answer, refuse, type Tools } from "../answer";

const WHAT = ["note", "letter", "movement", "sick", "craving", "off", "feeling", "first", "question", "appointment", "task", "line"] as const;

export function removeTools({ ctx, keep }: Tools) {
  keep(
    "remove",
    {
      title: "Remove something kept",
      description:
        "Take back something kept, by its kind and id (from journal, questions, appointments, tasks or lists): a note or letter, a movement, sickness, a craving or something gone off, your own feeling, a first (its id is its key), a question, an appointment (cancelled), a task of your own, or a line of your own. To put right what was kept wrong, remove it and keep it again. Only when asked, or to undo your own mistake; say what you removed. Photos and papers are removed in the app.",
      inputSchema: { what: z.enum(WHAT), id: z.string().min(1).max(200) },
    },
    ({ what, id }) => {
      const { db, personId } = ctx();
      const none = refuse(`No ${what} ${id}.`);
      switch (what) {
        case "note":
        case "letter":
        case "movement": {
          const repo = new JournalRepo(db);
          const entry = repo.list().find((e) => e.id === id && e.kind === what);
          if (!entry) return none;
          repo.delete(id);
          return answer({ removed: what, was: { day: entry.day, time: entry.time, text: entry.body } });
        }
        case "sick":
        case "craving":
        case "off": {
          const repo = new AppetiteRepo(db);
          const entry = repo.list().find((e) => e.id === id && e.kind === what);
          if (!entry) return none;
          repo.delete(id);
          return answer({ removed: what, was: { day: entry.day, time: entry.time, how: entry.how, what: entry.what, note: entry.note } });
        }
        case "feeling": {
          const repo = new FeelingsRepo(db);
          const feeling = repo.list(personId).find((f) => f.id === id);
          if (!feeling) return none;
          if (!isOwn(feeling)) return refuse("That's the other parent's feeling: only they can take it back.");
          repo.delete(id, personId);
          return answer({ removed: what, was: { day: feeling.day, time: feeling.time, step: feeling.step, words: feeling.words, note: feeling.note } });
        }
        case "first": {
          const repo = new FirstsRepo(db);
          const mark = repo.list().find((f) => f.key === id && f.day);
          if (!mark) return none;
          repo.unmark(id);
          return answer({ removed: what, was: { first: id, day: mark.day } });
        }
        case "question": {
          const repo = new QuestionsRepo(db);
          const question = repo.list().find((q) => q.id === id);
          if (!question) return none;
          repo.delete(id);
          return answer({ removed: what, was: { text: question.text, entry: question.itemId, asked: question.askedAt, answer: question.answer } });
        }
        case "appointment": {
          const repo = new AppointmentsRepo(db);
          const appointment = repo.list().find((a) => a.id === id);
          if (!appointment) return none;
          repo.delete(id);
          const { title, day, time, place, notes } = appointment;
          return answer({ removed: what, was: { title, day, time, place, notes } });
        }
        case "task": {
          const repo = new ChecklistRepo(db);
          const task = repo.ownTasks().find((t) => t.id === id);
          if (!task) return refuse(`No task of your own ${id}: a built-in task can't be removed, only ticked.`);
          repo.deleteOwnTask(id);
          return answer({ removed: what, was: { title: task.title, week: task.week } });
        }
        case "line": {
          const repo = new ListsRepo(db);
          const line = repo.all().ownLines.find((l) => l.id === id);
          if (!line) return refuse(`No line of your own ${id}: a built-in line can't be removed; mark it not needed.`);
          repo.deleteLine(id);
          return answer({ removed: what, was: { list: line.listId, title: line.title, section: line.section } });
        }
      }
    },
    true
  );
}
