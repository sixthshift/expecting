// The shape of a built-in item, as written in content/items/<id>.md frontmatter, and
// the normalised item the rest of the app reads. Our own items, when they
// arrive, normalise to the same `Item`.

import type { Node } from "@markdoc/markdoc";
import { z } from "zod";
import { extra } from "../features/settings/model/extras";
import { checkWhen, question, type When, whenSchema } from "../features/settings/model/facts";
import { VIEW_KEYS, type View } from "../lib/circle";
import { isISODate } from "../lib/dates";
import { FIRST_KEYS, type FirstKey } from "../lib/firsts";
import { LISTS, listOf } from "../lib/lists";
import type { Who } from "../lib/people";
import { WEEKS, type Week } from "../lib/timeline";

/** What kind of entry an item is: each has its own page, and its own body shape (src/content/parse.ts). */
const TYPES = ["moment", "payment", "decision", "can-i", "symptom", "guide", "card", "term"] as const;

export type ItemType = (typeof TYPES)[number];

/** What each type is called on its page; a moment is just itself. */
export const TYPE_LABELS: Record<ItemType, string | null> = {
  moment: null,
  payment: "Money and leave",
  decision: "A decision",
  "can-i": "Can I…?",
  symptom: "Is this normal?",
  guide: "Guide",
  card: "Nobody tells you",
  term: "Glossary",
};

/** The Library's shelves, in their usual order: the map's topics (content/map/README.md), and the extras'. */
export const TOPICS = {
  food: "Food",
  drink: "Drink",
  medicines: "Medicines",
  activities: "Activities",
  body: "Body",
  baby: "Baby",
  tests: "Tests",
  appointments: "Appointments",
  care: "Care",
  labour: "Labour",
  birth: "Birth",
  "after-the-birth": "After the birth",
  feeding: "Feeding",
  "mental-health": "Mental health",
  relationships: "Relationships",
  loss: "Loss",
  money: "Money",
  work: "Work",
  paperwork: "Paperwork",
  gear: "Baby gear",
  partner: "Partner",
  travel: "Travel",
  "special-circumstances": "Special circumstances",
  celebrations: "Celebrations",
} as const;

export type Topic = keyof typeof TOPICS;

/** A can-i's answer: go ahead, in moderation, don't, or ask your doctor or midwife first. */
export const VERDICTS = ["yes", "limit", "avoid", "ask"] as const;

export type Verdict = (typeof VERDICTS)[number];

/** A symptom's levels, most urgent first: the four content/README.md names, after what's usual. */
export const SYMPTOM_LEVELS = [
  "Call 000 or go to emergency",
  "Contact your hospital now",
  "See your doctor or midwife",
  "Mention it at your next visit",
] as const;

/** What a wrong answer costs: health, safety or a deadline; something; little. */
const STAKES = ["high", "medium", "low"] as const;

type Stakes = (typeof STAKES)[number];

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "ids are lower-case words joined by hyphens");
const isoDate = z.string().refine(isISODate, "a date as YYYY-MM-DD");

const weekRange = z
  .union([z.number().int(), z.tuple([z.number().int(), z.number().int()])])
  .transform((w): [number, number] => (typeof w === "number" ? [w, w] : w));

const who = z.enum(["carrying", "partner", "together"]);

/**
 * The frontmatter every list reads: what it is, where it sits, when and for
 * whom, and what it asks of you. The rest (PAGE_FIELDS in ./file) is
 * `pageSchema`, read when its page opens.
 */
export const indexSchema = z
  .object({
    id: slug,
    title: z.string().min(1),
    type: z.enum(TYPES),
    topic: z.enum(Object.keys(TOPICS) as [Topic, ...Topic[]]),
    /** The question as people ask it: "Can I eat brie?" */
    ask: z.string().min(1).optional(),
    /** What people search for: brands, slang, other words for it. */
    aliases: z.array(z.string().min(1)).default([]),
    /** Why it matters, in one sentence, from the body: under its title in a list and on its page. */
    summary: z.string().min(1).optional(),
    /** A week, or [from, to] inclusive. Without weeks it's in the Library only: not on the timeline, never open. */
    weeks: weekRange.optional(),
    /** Who it's written for; omitted, everyone. */
    who: who.optional(),
    /** What a wrong answer costs. */
    stakes: z.enum(STAKES).optional(),
    /** A can-i's answer. */
    verdict: z.enum(VERDICTS).optional(),
    /** A decision's week to decide by, from its source, within its weeks: it becomes a task, `decide-<id>`. */
    decide_by: z.number().int().optional(),
    /** Only when your answers match: `{ cover: "no", state: [vic, nsw] }`. See src/features/settings/model/facts.data.ts. */
    when: whenSchema.default({}),
    /** Part of an extra in src/features/settings/model/extras.data.ts: shown only once you turn it on. */
    extra: z.string().optional(),
    /** One of the things nobody tells you. A card is one by type. */
    surprise: z.boolean().default(false),
    /** Read, but never saved, asked about or remembered, so it leaves no trace in the space you share. */
    private: z.boolean().default(false),
    /**
     * Shared, but not named where both of you look: a question asked from it
     * doesn't say "from <title>" in the Planner or on This week, as the title
     * would tell what its words don't (mental health, drugs, smoking).
     */
    discreet: z.boolean().default(false),
    tasks: z
      .array(
        z
          .object({
            id: slug,
            title: z.string().min(1),
            /** The earliest week it can or should be done, within the item's weeks. Defaults to the start of its range. */
            opens: z.number().int().optional(),
            /** Best by: when it's comfortably done, lead time allowed for. Within the item's weeks; defaults to the end of its range. */
            due: z.number().int().optional(),
            /**
             * A hard week, where missing it costs something: on or after `due`, by week 42. From the item's source.
             * Or counted back from a date you give: `{ before: leaveStart, weeks: 10, week: 30 }`, with
             * `week` standing in until the date is known.
             */
            deadline: z.union([z.number().int(), z.object({ before: z.string(), weeks: z.number().int().min(0), week: z.number().int() }).strict()]).optional(),
            /** Whose job it is. */
            who: who.default("together"),
            /**
             * What doing it keeps, and where: `letter` (the Journal's letter to the baby), `photo`, a first
             * (`{ first: cot-up }`), or a view of Your people (`{ people: visitors }`). Its task offers the way there.
             */
            keeps: z
              .union([
                z.enum(["letter", "photo"]),
                z.object({ first: z.enum(FIRST_KEYS) }).strict(),
                z.object({ people: z.enum(VIEW_KEYS as [View, ...View[]]) }).strict(),
              ])
              .optional(),
          })
          .strict()
      )
      .default([]),
    /** What to get, a line each on one of the lists (src/lib/lists.ts), restating what the body says. */
    lines: z
      .array(
        z
          .object({
            id: slug,
            title: z.string().min(1),
            /** One of LISTS. */
            list: z.string(),
            /** One of its list's sections. */
            section: z.string(),
            /** Only when your answers match, narrowing the item's own. */
            when: whenSchema.default({}),
            /** A task of this item's that it belongs to, whose when it shows. */
            task: slug.optional(),
          })
          .strict()
      )
      .default([]),
  })
  .strict()
  .superRefine((fm, ctx) => {
    for (const message of checkWhen(fm.when)) ctx.addIssue({ code: "custom", path: ["when"], message });
    for (const [i, line] of fm.lines.entries()) {
      for (const message of checkWhen(line.when)) ctx.addIssue({ code: "custom", path: ["lines", i, "when"], message });
      const list = listOf(line.list);
      if (!list) ctx.addIssue({ code: "custom", path: ["lines", i, "list"], message: `"${line.list}" is not a list: ${Object.keys(LISTS).join(", ")}` });
      else if (!(line.section in list.sections)) {
        ctx.addIssue({
          code: "custom",
          path: ["lines", i, "section"],
          message: `"${line.section}" is not a section of ${line.list}: ${Object.keys(list.sections).join(", ")}`,
        });
      }
      if (line.task !== undefined && !fm.tasks.some((t) => t.id === line.task)) {
        ctx.addIssue({ code: "custom", path: ["lines", i, "task"], message: `"${line.task}" is not one of this item's tasks` });
      }
    }
    if (fm.extra !== undefined && !extra(fm.extra))
      ctx.addIssue({ code: "custom", path: ["extra"], message: `"${fm.extra}" is not an extra in extras.data.ts` });
    if (fm.private) {
      // Leaves no trace in the space you share: nothing to tick, nothing that turns on a shared answer or an extra.
      if (fm.tasks.length > 0) ctx.addIssue({ code: "custom", path: ["tasks"], message: "a private entry has no tasks: a tick is shared" });
      if (fm.lines.length > 0) ctx.addIssue({ code: "custom", path: ["lines"], message: "a private entry has no lines: a list is shared" });
      if (fm.decide_by !== undefined) ctx.addIssue({ code: "custom", path: ["decide_by"], message: "a private entry has no decide_by: it would be a task" });
      if (Object.keys(fm.when).length > 0) ctx.addIssue({ code: "custom", path: ["when"], message: "a private entry is for everyone: no when" });
      if (fm.extra !== undefined) ctx.addIssue({ code: "custom", path: ["extra"], message: "a private entry is for everyone: no extra" });
    }
    if ((fm.type === "can-i") !== (fm.verdict !== undefined)) {
      ctx.addIssue({ code: "custom", path: ["verdict"], message: "a can-i has a verdict, and nothing else does" });
    }
    if (fm.decide_by !== undefined) {
      if (fm.type !== "decision") ctx.addIssue({ code: "custom", path: ["decide_by"], message: "only a decision has a decide_by" });
      else if (!fm.weeks) ctx.addIssue({ code: "custom", path: ["decide_by"], message: "decide_by falls within the decision's weeks, so it needs weeks" });
      else if (fm.decide_by < fm.weeks[0] || fm.decide_by > fm.weeks[1]) {
        ctx.addIssue({ code: "custom", path: ["decide_by"], message: `decide_by is within the decision's weeks, ${fm.weeks[0]}–${fm.weeks[1]}` });
      }
    }
    if (!fm.weeks) {
      if (fm.tasks.length > 0) ctx.addIssue({ code: "custom", path: ["tasks"], message: "tasks fall due within the item's weeks, so it needs weeks" });
      return;
    }
    const [from, to] = fm.weeks;
    if (from < WEEKS.first || to > WEEKS.last || from > to) {
      ctx.addIssue({ code: "custom", path: ["weeks"], message: `weeks must run forwards within ${WEEKS.first}–${WEEKS.last}` });
    }
    for (const [i, t] of fm.tasks.entries()) {
      if (t.due !== undefined && (t.due < from || t.due > to)) {
        ctx.addIssue({ code: "custom", path: ["tasks", i, "due"], message: `due must be within the item's weeks, ${from}–${to}` });
      }
      const due = t.due ?? to;
      if (t.opens !== undefined && (t.opens < from || t.opens > due)) {
        ctx.addIssue({ code: "custom", path: ["tasks", i, "opens"], message: `opens must be within the item's weeks and no later than due, ${from}–${due}` });
      }
      const deadline = typeof t.deadline === "object" ? t.deadline.week : t.deadline;
      if (typeof t.deadline === "object") {
        const q = question(t.deadline.before);
        if (q?.type !== "date") {
          ctx.addIssue({ code: "custom", path: ["tasks", i, "deadline", "before"], message: `"${t.deadline.before}" is not a date question in facts.data.ts` });
        }
      }
      if (deadline !== undefined && (deadline < due || deadline > WEEKS.last)) {
        ctx.addIssue({
          code: "custom",
          path: ["tasks", i, "deadline"],
          message: `a deadline is on or after due and no later than week ${WEEKS.last}, ${due}–${WEEKS.last}`,
        });
      }
    }
  });

export type IndexFrontmatter = z.output<typeof indexSchema>;

/** The frontmatter only its page shows. */
export const pageSchema = z
  .object({
    /** Every page a claim in the body comes from. */
    sources: z.array(z.object({ title: z.string().min(1), url: z.url() }).strict()).default([]),
    /** Ids of the entries it links to, each checked to exist. */
    related: z.array(slug).default([]),
    /** When a second reader last confirmed every claim against the sources. */
    checked: isoDate.optional(),
    /**
     * Up to 3 questions to ask your midwife or doctor about your own case,
     * suggested on "Ask at my next appointment" (docs/product/planner.md):
     * in the reader's voice, short, each a question. Never on a private entry, a card or a term.
     */
    appointment: z
      .array(
        z
          .string()
          .trim()
          .min(1)
          .max(120, "an appointment question stays short: 120 characters at most")
          .refine((q) => q.endsWith("?"), "an appointment question is a question: it ends in ?")
      )
      .max(3, "at most 3 appointment questions")
      .default([]),
  })
  .strict();

/** What a task keeps when it's done: a letter to the baby, a photo, a first, or what a view of Your people holds. */
export type Keeps = "letter" | "photo" | { first: FirstKey } | { people: View };

export type Task = {
  id: string;
  title: string;
  /** The earliest week it can or should be done. */
  opens: Week;
  /** Best by. */
  due: Week;
  /** A hard deadline, when there is one. */
  deadline: Week | null;
  /** Counted back from a date fact (whose, by `who`) when it's known: `deadline` stands in until then. */
  deadlineFrom: { fact: string; weeks: number } | null;
  who: Who;
  /** What doing it keeps, opened from the task; null when it keeps nothing. */
  keeps: Keeps | null;
  /** The item this task belongs to; null for a standalone task. */
  itemId: string | null;
  origin: "built-in" | "own";
};

/** A line on one of the lists: something to get. Built-in from an item's `lines`, or one of your own. */
export type Line = {
  id: string;
  title: string;
  /** A built-in list's id (LISTS), or one of your own lists' UUID. */
  listId: string;
  /** One of its list's sections; null for an own line put in none. */
  section: string | null;
  /** Who it is for, narrowing its item's; empty for everyone. */
  when: When;
  /** The task it belongs to, whose when it shows. */
  taskId: string | null;
  /** The item it comes from; null for your own. */
  itemId: string | null;
  origin: "built-in" | "own";
};

type ItemFields = {
  id: string;
  title: string;
  type: ItemType;
  topic: Topic;
  /** The question as people ask it; null when none is written. */
  ask: string | null;
  aliases: string[];
  /** Why it matters, in one sentence; null when none is written. */
  summary: string | null;
  /** Who it's written for; null for everyone. */
  who: Who | null;
  stakes: Stakes | null;
  verdict: Verdict | null;
  decideBy: Week | null;
  /** One of the things nobody tells you: marked so, or a card. */
  surprise: boolean;
  private: boolean;
  discreet: boolean;
  /** Who it is for; empty for everyone. */
  when: When;
  /** The extra it belongs to, shown only when that's on; null for everyone. */
  extra: string | null;
  /** The questions its body names (`$cover`), whose answers change its words. */
  variables: string[];
  tasks: Task[];
  lines: Line[];
  origin: "built-in" | "own";
};

/**
 * An item as every list reads it. With weeks, it's on the timeline from `from`
 * to `to`, inclusive; without (both null), it's in the Library only.
 */
export type Item = ItemFields & ({ from: Week; to: Week } | { from: null; to: null });

/** An item with weeks. */
export type DatedItem = Item & { from: Week; to: Week };

/** Whether `item` has weeks: is on the timeline. */
export function isDated(item: Item): item is DatedItem {
  return item.from !== null;
}

/** Whether `item` asks something of you: has tasks, so a window to do them in (tasks need weeks). */
export function asks(item: Item): item is DatedItem {
  return item.tasks.length > 0 && isDated(item);
}

/** What only an item's own page shows, loaded when it opens. */
export type ItemPage = {
  sources: { title: string; url: string }[];
  related: string[];
  checked: string | null;
  /** The questions it suggests asking at the next appointment. */
  appointment: string[];
  /** The body as written: Markdown, with Markdoc tags. */
  body: string;
  /** The body parsed and checked, ready to render. */
  doc: Node;
};
