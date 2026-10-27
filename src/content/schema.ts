// The shape of a built-in item, as written in content/<phase>/<id>.md frontmatter, and
// the normalised item the rest of the app reads. Our own items, when they
// arrive, normalise to the same `Item`.

import type { Node } from "@markdoc/markdoc";
import { z } from "zod";
import { isISODate } from "../lib/dates";
import { POSTPARTUM_WEEKS, PREGNANCY_WEEKS, type Slot } from "../lib/timeline";
import { isAnswer, question, type When } from "./profile";

export const CATEGORIES = {
  appointments: "Appointments",
  body: "Body",
  baby: "Baby",
  paperwork: "Paperwork",
  money: "Money",
  "baby-gear": "Baby gear",
  partner: "Partner",
  "after-the-birth": "After the birth",
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
    /** Not written in the file: its folder, `content/<phase>/`, supplies it. */
    phase: z.enum(["preconception", "pregnancy", "postpartum"]),
    /** A week, or [from, to] inclusive, within the phase. Omitted for `preconception`. */
    weeks: weekRange.optional(),
    category: z.enum(Object.keys(CATEGORIES) as [Category, ...Category[]]),
    /** Only for households whose answers match: `{ cover: [no, unsure] }`. See content/profile.yaml. */
    when: z
      .record(z.string(), z.union([z.string(), z.array(z.string()).min(1)]))
      .transform((w): When => Object.fromEntries(Object.entries(w).map(([q, a]) => [q, typeof a === "string" ? [a] : a])))
      .default({}),
    /** One of the things nobody tells you. */
    surprise: z.boolean().default(false),
    /** Drafted, not yet reviewed by us. Shown with a marker. */
    draft: z.boolean().default(true),
    source: z.object({ title: z.string().min(1), url: z.url() }).optional(),
    /** When the source was last confirmed. */
    checked: isoDate.optional(),
    tasks: z
      .array(
        z.object({
          id: slug,
          title: z.string().min(1),
          /** Due week, within the item's weeks. Defaults to the end of its range. */
          due: z.number().int().optional(),
        })
      )
      .default([]),
  })
  .strict()
  .superRefine((fm, ctx) => {
    for (const [q, answers] of Object.entries(fm.when)) {
      if (!question(q)) ctx.addIssue({ code: "custom", path: ["when", q], message: `"${q}" is not a question in profile.yaml` });
      else for (const a of answers) if (!isAnswer(q, a)) ctx.addIssue({ code: "custom", path: ["when", q], message: `"${a}" is not an answer to ${q}` });
    }
    if (fm.phase === "preconception") {
      if (fm.weeks) ctx.addIssue({ code: "custom", path: ["weeks"], message: "a preconception item has no weeks" });
      for (const [i, t] of fm.tasks.entries()) {
        if (t.due !== undefined) ctx.addIssue({ code: "custom", path: ["tasks", i, "due"], message: "a preconception task has no due week" });
      }
      return;
    }
    if (!fm.weeks) {
      ctx.addIssue({ code: "custom", path: ["weeks"], message: `a ${fm.phase} item needs weeks` });
      return;
    }
    const bounds = fm.phase === "pregnancy" ? PREGNANCY_WEEKS : POSTPARTUM_WEEKS;
    const [from, to] = fm.weeks;
    if (from < bounds.first || to > bounds.last || from > to) {
      ctx.addIssue({ code: "custom", path: ["weeks"], message: `weeks must run forwards within ${bounds.first}–${bounds.last}` });
    }
    for (const [i, t] of fm.tasks.entries()) {
      if (t.due !== undefined && (t.due < from || t.due > to)) {
        ctx.addIssue({ code: "custom", path: ["tasks", i, "due"], message: `due must be within the item's weeks, ${from}–${to}` });
      }
    }
  });

export type Frontmatter = z.output<typeof frontmatterSchema>;

export type Task = {
  id: string;
  title: string;
  due: Slot;
  /** The item this task belongs to; null for a standalone task. */
  itemId: string | null;
  origin: "built-in" | "own";
};

export type Item = {
  id: string;
  title: string;
  /** First and last slot the item applies to, inclusive. Same phase. */
  from: Slot;
  to: Slot;
  category: Category;
  surprise: boolean;
  draft: boolean;
  source: { title: string; url: string } | null;
  checked: string | null;
  /** Who it is for; empty for everyone. */
  when: When;
  /** The body as written: Markdown, with Markdoc tags. */
  body: string;
  /** The body parsed and checked, ready to render. */
  doc: Node;
  tasks: Task[];
  origin: "built-in" | "own";
};
