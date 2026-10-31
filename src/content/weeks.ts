// This week: one note per week, as written in content/weeks/<week>.md, where
// the file's name is the week (`28`). A note has three
// parts, each a `##` heading in the body, in this order: the baby, the
// pregnant parent's body, and the partner. Each part is Markdoc like an item's
// body, so it can be tailored with {% if %}.
//
//   ---
//   title: Lungs getting ready
//   size: { length: 25, weight: 1000, like: an eggplant }
//   source: { title: …, url: … }
//   ---
//   ## The baby
//   ## Your body
//   ## For the partner

import { Ast, type Node } from "@markdoc/markdoc";
import { z } from "zod";
import { isISODate } from "../lib/dates";
import { parseWeekKey, type Week } from "../lib/timeline";
import { ContentError, readFrontmatter } from "./file";
import { parseBody } from "./markdoc";

export const SECTIONS = { baby: "The baby", body: "Your body", partner: "For the partner" } as const;

export type Section = keyof typeof SECTIONS;

const isoDate = z.string().refine(isISODate, "a date as YYYY-MM-DD");

const frontmatterSchema = z
  .object({
    /** A few words for the week, shown above its parts and on the folded week. */
    title: z.string().min(1),
    /** How big the baby is, from the source. Length is head to bottom. */
    size: z
      .object({
        /** Centimetres, head to bottom. */
        length: z.number().positive(),
        /** Grams. Omitted while too small to say. */
        weight: z.number().positive().optional(),
        /** Something about that size, for fun: "an eggplant". */
        like: z.string().min(1).optional(),
        /** Where the length and weight come from, when it isn't the note's own source. */
        source: z.object({ title: z.string().min(1), url: z.url() }).optional(),
      })
      .strict()
      .optional(),
    /** Drafted, not yet reviewed by us. Shown with a marker. */
    draft: z.boolean().default(true),
    source: z.object({ title: z.string().min(1), url: z.url() }).optional(),
    /** When the source was last confirmed. */
    checked: isoDate.optional(),
  })
  .strict();

export type WeekNote = {
  /** The week, which is also the file's name: `28`. */
  week: Week;
  title: string;
  size: { length: number; weight: number | null; like: string | null; source: { title: string; url: string } | null } | null;
  /** Each part's body, parsed and checked, ready to render. */
  sections: Record<Section, Node>;
  draft: boolean;
  source: { title: string; url: string } | null;
  checked: string | null;
};

/** The text of a heading node. */
function headingText(node: Node): string {
  return [...node.walk()]
    .filter((n) => n.type === "text")
    .map((n) => String(n.attributes.content))
    .join("")
    .trim();
}

/** The body cut at its `##` headings, which must be the three parts, in order, each with something under it. */
function splitSections(file: string, doc: Node): Record<Section, Node> {
  const names = Object.keys(SECTIONS) as Section[];
  const parts: Node[][] = [];
  for (const child of doc.children) {
    if (child.type === "heading") {
      const want = SECTIONS[names[parts.length]!];
      if (child.attributes.level !== 2 || headingText(child) !== want) {
        throw new ContentError(
          file,
          `the parts are ${names.map((n) => `"## ${SECTIONS[n]}"`).join(", ")}, in that order; found "${"#".repeat(child.attributes.level)} ${headingText(child)}"`
        );
      }
      parts.push([]);
    } else if (parts.length === 0) {
      throw new ContentError(file, `the body starts with "## ${SECTIONS.baby}"`);
    } else {
      parts.at(-1)!.push(child);
    }
  }
  if (parts.length !== names.length) throw new ContentError(file, `a week has ${names.length} parts: ${names.map((n) => SECTIONS[n]).join(", ")}`);
  return Object.fromEntries(
    names.map((name, i) => {
      if (parts[i]!.length === 0) throw new ContentError(file, `"${SECTIONS[name]}" is empty`);
      return [name, new Ast.Node("document", {}, parts[i]!)];
    })
  ) as Record<Section, Node>;
}

/** One file, `weeks/<week>.md`, into a note. Throws a ContentError naming the file on any problem. */
export function parseWeek(file: string, source: string): WeekNote {
  const name = file.split("/").at(-1)!;
  const key = name.endsWith(".md") ? name.slice(0, -".md".length) : name;
  const week = parseWeekKey(key);
  if (week === null || String(week) !== key || !name.endsWith(".md")) {
    throw new ContentError(file, "a week's file is named for its week, 1–42, as weeks/28.md");
  }

  const { raw, body } = readFrontmatter(file, source);
  const parsed = frontmatterSchema.safeParse(raw);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; ");
    throw new ContentError(file, problems);
  }
  const { ast, problems } = parseBody(body);
  if (problems.length > 0) throw new ContentError(file, `in the body, ${problems.join("; ")}`);

  const fm = parsed.data;
  return {
    week,
    title: fm.title,
    size: fm.size ? { length: fm.size.length, weight: fm.size.weight ?? null, like: fm.size.like ?? null, source: fm.size.source ?? null } : null,
    sections: splitSections(file, ast),
    draft: fm.draft,
    source: fm.source ?? null,
    checked: fm.checked ?? null,
  };
}

/** Every file into notes, one per week. */
export function parseWeeks(files: Record<string, string>): WeekNote[] {
  return Object.entries(files).map(([file, source]) => parseWeek(file, source));
}

/** "about 25 cm from head to bottom and about 1 kg, the size of an eggplant". */
export function sizeLabel(size: Pick<NonNullable<WeekNote["size"]>, "length" | "weight" | "like">): string {
  const length = size.length < 1 ? `${Math.round(size.length * 10)} mm` : `${Number(size.length.toFixed(1))} cm`;
  const weight = size.weight === null ? null : size.weight < 1000 ? `${Math.round(size.weight)} g` : `${Number((size.weight / 1000).toFixed(1))} kg`;
  const measures = weight ? `about ${length} from head to bottom and about ${weight}` : `about ${length} from head to bottom`;
  return size.like ? `${measures}: about the size of ${size.like}` : measures;
}

/** The first sentence of the baby's part, as plain text: what this week's page opens with. */
export function babyLead(note: WeekNote): string {
  const paragraph = [...note.sections.baby.walk()].find((n) => n.type === "paragraph");
  const text = paragraph
    ? [...paragraph.walk()]
        .filter((n) => n.type === "text")
        .map((n) => String(n.attributes.content))
        .join("")
    : "";
  return text.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? text;
}

/** The note in force in `week`: its own, or else the latest before it, until the next is written. */
export function noteFor(notes: readonly WeekNote[], week: Week): WeekNote | null {
  return notes.reduce<WeekNote | null>((found, note) => (note.week <= week && (!found || note.week > found.week) ? note : found), null);
}
