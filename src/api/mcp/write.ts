// The tools that keep things: what the "+" keeps, and ticking off a task.
// Each is kept as the person the connection speaks for, stamped now. Like a
// server function's input, every tool's arguments pass refusePrivate first
// (src/server/privacy/guard.ts): nothing that names a private entry is saved.

import type { McpServer, ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ZodRawShapeCompat } from "@modelcontextprotocol/sdk/server/zod-compat.js";
import type { CallToolResult, ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { isBuiltInItemId, isBuiltInTaskId } from "../../content";
import { AppetiteRepo } from "../../db/models/appetite/repo";
import { ChecklistRepo } from "../../db/models/checklist/repo";
import { FeelingsRepo } from "../../db/models/feelings/repo";
import { FirstsRepo } from "../../db/models/firsts/repo";
import { JournalRepo } from "../../db/models/journal/repo";
import { QuestionsRepo } from "../../db/models/questions/repo";
import { HOWS } from "../../lib/appetite";
import { isISODate, todayISO } from "../../lib/dates";
import { STEPS, WORDS } from "../../lib/feelings";
import { FIRST_KEYS } from "../../lib/firsts";
import { TIME } from "../../lib/journal";
import { WEEKS } from "../../lib/timeline";
import { refusePrivate } from "../../server/privacy/guard";
import type { Context } from "./context";
import { answer, refuse } from "./tools";

const KEEP: ToolAnnotations = { readOnlyHint: false, destructiveHint: false, openWorldHint: false };

const day = z.string().refine(isISODate, "A date, YYYY-MM-DD").optional().describe("The day it happened, YYYY-MM-DD; today if left out");
const time = z.string().regex(TIME, "HH:MM").optional().describe("When, HH:MM, 24-hour");

/** HH:MM now, on the server's clock. */
function timeNow(now: Date): string {
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export function writeTools(server: McpServer, ctx: () => Context) {
  /** A tool that keeps something: refused, and nothing kept, if its arguments name a private entry. */
  function keep<Args extends ZodRawShapeCompat>(name: string, config: { title: string; description: string; inputSchema: Args }, run: ToolCallback<Args>) {
    const call = run as unknown as (args: unknown, extra: unknown) => CallToolResult | Promise<CallToolResult>;
    const guarded = ((args: unknown, extra: unknown) =>
      refusePrivate(args) ? refuse("That stays private, so it isn't kept.") : call(args, extra)) as unknown as ToolCallback<Args>;
    server.registerTool(name, { ...config, annotations: KEEP }, guarded);
  }

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
      inputSchema: { title: z.string().trim().min(1).max(200), week: z.number().int().min(WEEKS.first).max(WEEKS.last) },
    },
    ({ title, week }) => {
      const { db, now } = ctx();
      const task = new ChecklistRepo(db).addOwnTask({ title, week: week as never }, now);
      return answer({ kept: "task", id: task.id });
    }
  );

  keep(
    "add_question",
    {
      title: "Keep a question for an appointment",
      description: "Keep a question to ask at the next appointment, optionally about a Library entry (its id).",
      inputSchema: { text: z.string().trim().min(1).max(500), entry: z.string().max(200).optional() },
    },
    ({ text, entry }) => {
      const { db, personId, now } = ctx();
      if (entry && !isBuiltInItemId(entry)) return refuse(`No entry ${entry}.`);
      const question = new QuestionsRepo(db).add(text, { itemId: entry ?? null, by: personId }, now);
      return answer({ kept: "question", id: question.id });
    }
  );

  keep(
    "mark_question_asked",
    {
      title: "Mark a question asked",
      description: "Mark a kept question asked at the appointment, with what you were told.",
      inputSchema: { id: z.uuid(), answer: z.string().max(5000).default("") },
    },
    ({ id, answer: told }) => {
      const { db, now } = ctx();
      new QuestionsRepo(db).markAsked(id, told, now);
      return answer("Marked asked.");
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
        { id: crypto.randomUUID(), kind: "sick", day: d ?? todayISO(now), time: t ?? null, how, what: null, note: note ?? null },
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
        { id: crypto.randomUUID(), kind: goneOff ? "off" : "craving", day: d ?? todayISO(now), time: t ?? null, how: null, what, note: note ?? null },
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
