// Day by day: a short read for each day of a week after the first, as written in
// content/days/<week>/<day>.md, `20/3.md` for 20+3. The week's note is its
// first day (+0); these are +1 to +6. Each is a way into the Library from where
// you are: it says what's true now, from entries already checked, and names them
// in `read`, the links under it. It makes no claim its entries don't.
//
//   ---
//   title: What the scan is looking at
//   read: [morphology-scan]
//   ---
//   The morphology scan is a detailed ultrasound…
//
// The body is Markdoc like an item's, so it can be tailored with {% if %}, but
// has no links: an entry is reached through `read`, which ItemLink draws.

import type { Node } from "@markdoc/markdoc";
import { z } from "zod";
import { parseWeekKey, type Week } from "../lib/timeline";
import { ContentError, readFrontmatter } from "./file";
import { parseBody } from "./markdoc";

/** The days after the note, +1 to +6. */
export const DAYS = { first: 1, last: 6 } as const;

const frontmatterSchema = z
  .object({
    /** A few words: what this read is about. */
    title: z.string().min(1),
    /** The entries it opens onto, at least one: Library ids. */
    read: z.array(z.string().min(1)).min(1),
  })
  .strict();

export type DayRead = {
  week: Week;
  /** 1–6: the day of the week it comes out, as in 20+3. */
  day: number;
  title: string;
  read: string[];
  body: Node;
};

/** One file, `days/<week>/<day>.md`, into a read. Throws a ContentError naming the file on any problem. */
export function parseDay(file: string, source: string): DayRead {
  const [weekKey, name] = file.split("/").slice(-2);
  const week = weekKey ? parseWeekKey(weekKey) : null;
  const dayKey = name?.endsWith(".md") ? name.slice(0, -".md".length) : "";
  const day = /^\d$/.test(dayKey) ? Number(dayKey) : Number.NaN;
  if (week === null || String(week) !== weekKey || !(day >= DAYS.first && day <= DAYS.last)) {
    throw new ContentError(file, `a day's file is days/<week>/<day>.md, the week 1–42 and the day ${DAYS.first}–${DAYS.last}, as days/20/3.md`);
  }

  const { raw, body } = readFrontmatter(file, source);
  const parsed = frontmatterSchema.safeParse(raw);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; ");
    throw new ContentError(file, problems);
  }
  const { ast, problems } = parseBody(body);
  if (problems.length > 0) throw new ContentError(file, `in the body, ${problems.join("; ")}`);
  if ([...ast.walk()].some((n) => n.type === "link")) throw new ContentError(file, "no links in the body: name the entries in `read`");
  if (!ast.children.some((n) => n.type === "paragraph")) throw new ContentError(file, "the body is empty");

  return { week, day, title: parsed.data.title, read: parsed.data.read, body: ast };
}

/** Every file into reads, by week then day. */
export function parseDays(files: Record<string, string>): DayRead[] {
  return Object.entries(files)
    .map(([file, source]) => parseDay(file, source))
    .sort((a, b) => a.week - b.week || a.day - b.day);
}

/**
 * The reads out in `week` by `gestationDays`: the week's own up to today, oldest
 * first. A week gone shows all of its; a week to come, none yet.
 */
export function readsOut(reads: readonly DayRead[], week: Week, gestationDays: number): DayRead[] {
  const today = gestationDays - week * 7;
  return reads.filter((r) => r.week === week && r.day <= today);
}
