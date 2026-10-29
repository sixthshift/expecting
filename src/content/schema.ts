// The shape of a built-in item, as written in content/items/<id>.md frontmatter, and
// the normalised item the rest of the app reads. Our own items, when they
// arrive, normalise to the same `Item`.

import type { Node } from "@markdoc/markdoc";
import { z } from "zod";
import { isISODate } from "../lib/dates";
import type { Who } from "../lib/people";
import { WEEKS, type Week } from "../lib/timeline";
import { extra } from "./extras";
import { checkWhen, question, type When, whenSchema } from "./facts";

export const CATEGORIES = {
  appointments: "Appointments",
  body: "Body",
  baby: "Baby",
  paperwork: "Paperwork",
  money: "Money",
  "baby-gear": "Baby gear",
  partner: "Partner",
  "after-the-birth": "After the birth",
  celebrations: "Celebrations",
} as const;

export type Category = keyof typeof CATEGORIES;

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "ids are lower-case words joined by hyphens");
const isoDate = z.string().refine(isISODate, "a date as YYYY-MM-DD");

const weekRange = z
  .union([z.number().int(), z.tuple([z.number().int(), z.number().int()])])
  .transform((w): [number, number] => (typeof w === "number" ? [w, w] : w));

export const frontmatterSchema = z
  .object({
    id: slug,
    title: z.string().min(1),
    /** Why it matters, in one sentence, from the body: under its title in a list and on its page. */
    summary: z.string().min(1).optional(),
    /** A week, or [from, to] inclusive. */
    weeks: weekRange,
    category: z.enum(Object.keys(CATEGORIES) as [Category, ...Category[]]),
    /** Only for households whose answers match: `{ cover: "no", state: [vic, nsw] }`. See content/facts.yaml. */
    when: whenSchema.default({}),
    /** Part of an extra in content/extras.yaml: shown only once the household turns it on. */
    extra: z.string().optional(),
    /** One of the things nobody tells you. */
    surprise: z.boolean().default(false),
    /** Drafted, not yet reviewed by us. Shown with a marker. */
    draft: z.boolean().default(true),
    source: z.object({ title: z.string().min(1), url: z.url() }).optional(),
    /** When the source was last confirmed. */
    checked: isoDate.optional(),
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
             * Or counted back from a date the household gives: `{ before: leaveStart, weeks: 10, week: 30 }`, with
             * `week` standing in until the date is known.
             */
            deadline: z.union([z.number().int(), z.object({ before: z.string(), weeks: z.number().int().min(0), week: z.number().int() }).strict()]).optional(),
            /** Whose job it is. */
            who: z.enum(["carrying", "partner", "together"]).default("together"),
          })
          .strict()
      )
      .default([]),
  })
  .strict()
  .superRefine((fm, ctx) => {
    for (const message of checkWhen(fm.when)) ctx.addIssue({ code: "custom", path: ["when"], message });
    if (fm.extra !== undefined && !extra(fm.extra)) ctx.addIssue({ code: "custom", path: ["extra"], message: `"${fm.extra}" is not an extra in extras.yaml` });
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
          ctx.addIssue({ code: "custom", path: ["tasks", i, "deadline", "before"], message: `"${t.deadline.before}" is not a date question in facts.yaml` });
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

export type Frontmatter = z.output<typeof frontmatterSchema>;

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
  /** The item this task belongs to; null for a standalone task. */
  itemId: string | null;
  origin: "built-in" | "own";
};

export type Item = {
  id: string;
  title: string;
  /** Why it matters, in one sentence; null when none is written. */
  summary: string | null;
  /** First and last week the item applies to, inclusive. */
  from: Week;
  to: Week;
  category: Category;
  surprise: boolean;
  draft: boolean;
  source: { title: string; url: string } | null;
  checked: string | null;
  /** Who it is for; empty for everyone. */
  when: When;
  /** The extra it belongs to, shown only when that's on; null for everyone. */
  extra: string | null;
  /** The body as written: Markdown, with Markdoc tags. */
  body: string;
  /** The body parsed and checked, ready to render. */
  doc: Node;
  tasks: Task[];
  origin: "built-in" | "own";
};
