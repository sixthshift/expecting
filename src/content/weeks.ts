// This week: one note per week, as written in content/weeks/<week>.md, where
// the file's name is the week (`28`). A note has three
// parts, each a `##` heading in the body, in this order: the baby, the
// pregnant parent's body, and the partner. Each part is Markdoc like an item's
// body, so it can be tailored with {% if %}.
//
//   ---
//   title: Lungs getting ready
//   size: { length: 37.6, to: heel, weight: 1210, like: a papaya }
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
    /** How big the baby is: what it's like, and its length and weight where `source` gives them. */
    size: z
      .object({
        /** Centimetres, from `source`. Omitted where no source gives it. */
        length: z.number().positive().optional(),
        /** What the length is measured to from the head: the bottom while the legs are curled, then the heel, as `source` says. */
        to: z.enum(["bottom", "heel"]).optional(),
        /** Grams. Omitted while too small to say. */
        weight: z.number().positive().optional(),
        /** The fruit or vegetable it's the size of, always as LIKE_SOURCE has it for the week: "a papaya". */
        like: z.string().min(1).optional(),
        /** Where the length and weight come from, when it isn't the note's own source. */
        source: z.object({ title: z.string().min(1), url: z.url() }).optional(),
      })
      .strict()
      .refine((s) => s.length !== undefined || s.like !== undefined, "a length or what it's like")
      .refine((s) => s.weight === undefined || s.length !== undefined, "a weight only with a length")
      .refine((s) => (s.length === undefined) === (s.to === undefined), "a length says what it's measured to (to: bottom or heel), and only a length")
      .refine((s) => s.length === undefined || s.source !== undefined, "a length gives its source")
      .optional(),
    source: z.object({ title: z.string().min(1), url: z.url() }).optional(),
    /** When the source was last confirmed. */
    checked: isoDate.optional(),
  })
  .strict();

export type WeekNote = {
  /** The week, which is also the file's name: `28`. */
  week: Week;
  title: string;
  size: {
    length: number | null;
    to: "bottom" | "heel" | null;
    weight: number | null;
    like: string | null;
    source: { title: string; url: string } | null;
  } | null;
  /** Each part's body, parsed and checked, ready to render. */
  sections: Record<Section, Node>;
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
    size: fm.size
      ? { length: fm.size.length ?? null, to: fm.size.to ?? null, weight: fm.size.weight ?? null, like: fm.size.like ?? null, source: fm.size.source ?? null }
      : null,
    sections: splitSections(file, ast),
    source: fm.source ?? null,
    checked: fm.checked ?? null,
  };
}

/** Every file into notes, one per week. */
export function parseWeeks(files: Record<string, string>): WeekNote[] {
  return Object.entries(files).map(([file, source]) => parseWeek(file, source));
}

/**
 * Where every week's `like` comes from: one page, weeks 4 to 40, "for fun
 * purposes only". Weeks 1 to 3 and 41 and 42 have none.
 */
export const LIKE_SOURCE = {
  title: "Pregnancy, Birth and Baby — How big is your baby?",
  url: "https://www.pregnancybirthbaby.org.au/pregnancy/pregnancy-stages/how-big-is-your-baby-infographic",
} as const;

type Size = Pick<NonNullable<WeekNote["size"]>, "length" | "to" | "weight" | "like">;

/** A size's figures in their units, "25 cm, 1 kg": millimetres while tiny, kilograms once heavy. */
function figures(size: Size): { length: string; weight: string | null } | null {
  if (size.length === null) return null;
  const length = size.length < 1 ? `${Math.round(size.length * 10)} mm` : `${Number(size.length.toFixed(1))} cm`;
  const weight = size.weight === null ? null : size.weight < 1000 ? `${Math.round(size.weight)} g` : `${Number((size.weight / 1000).toFixed(1))} kg`;
  return { length, weight };
}

/**
 * The size in a few words, to sit on one line at a phone's width beside its drawing: "A papaya · 37.6 cm, 1.2 kg",
 * or "The size of a blueberry" with no figures.
 */
export function sizeLine(size: Size): string {
  const f = figures(size);
  const said = f ? (f.weight ? `${f.length}, ${f.weight}` : f.length) : null;
  if (!size.like) return `About ${said}`;
  return said ? `${size.like.charAt(0).toUpperCase()}${size.like.slice(1)} · ${said}` : `The size of ${size.like}`;
}

/** "about 37.6 cm from head to heel and about 1.2 kg: about the size of a papaya". */
export function sizeLabel(size: Size): string {
  const f = figures(size);
  const span = `from head to ${size.to === "heel" ? "heel" : "bottom"}`;
  const measured = f ? (f.weight ? `about ${f.length} ${span} and about ${f.weight}` : `about ${f.length} ${span}`) : null;
  if (!size.like) return measured ?? "";
  return measured ? `${measured}: about the size of ${size.like}` : `about the size of ${size.like}`;
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
