import type { z } from "zod";
import type { Week } from "../lib/timeline";
import { ContentError, type IndexHalf, type PageHalf, splitItem } from "./file";
import { parseBody } from "./markdoc";
import { type IndexFrontmatter, type Item, type ItemPage, type ItemType, indexSchema, pageSchema, SYMPTOM_LEVELS, type Task } from "./schema";

/** The folder built-in items live in: `content/items/<id>.md`. */
const FOLDER = "items";

/**
 * Where a file says it belongs: `items/<id>.md`, the name its id. Anything
 * else is a ContentError.
 */
function idOf(file: string): string {
  const [folder, name] = file.split("/").slice(-2);
  if (folder !== FOLDER || !name?.endsWith(".md")) throw new ContentError(file, `belongs in ${FOLDER}/, as ${FOLDER}/<id>.md`);
  return name.slice(0, -".md".length);
}

function check<S extends z.ZodType>(file: string, schema: S, raw: unknown): z.output<S> {
  const parsed = schema.safeParse(raw);
  if (parsed.success) return parsed.data;
  const problems = parsed.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; ");
  throw new ContentError(file, problems);
}

/** An item's index half into the item every list reads. Throws a ContentError naming the file on any problem. */
function parseIndex({ file, frontmatter, variables }: IndexHalf): Item {
  const id = idOf(file);
  const fm = check(file, indexSchema, frontmatter);
  if (fm.id !== id) throw new ContentError(file, `id "${fm.id}" must be the file's name, ${id}`);
  return toItem(fm, variables);
}

/** An item's page half, its body parsed and checked against its type's shape. Throws a ContentError naming the file on any problem. */
export function parsePage(file: string, { frontmatter, body }: PageHalf, { type, private: secret }: Pick<Item, "type" | "private">): ItemPage {
  const fm = check(file, pageSchema, frontmatter);
  if (body.length === 0) throw new ContentError(file, "the body is empty");
  const { ast, problems } = parseBody(body);
  problems.push(...checkShape(type, body));
  // A question added to the Planner is shared: a private entry offers none.
  if (secret && /\{%\s*ask\b/.test(body)) problems.push("a private entry has no {% ask %}: the question would be saved where both of you see it");
  if (problems.length > 0) throw new ContentError(file, `in the body, ${problems.join("; ")}`);
  if (fm.appointment.length > 0) {
    if (secret) throw new ContentError(file, "a private entry has no appointment questions: one added would be saved where both of you see it");
    if (type === "card" || type === "term") throw new ContentError(file, `a ${type} has no appointment questions: it's about no one's own case`);
  }
  return { sources: fm.sources, related: fm.related, checked: fm.checked ?? null, appointment: fm.appointment, body, doc: ast };
}

/** One content file, `items/<id>.md`, whole: both halves. Throws a ContentError naming the file on any problem. */
export function parseItem(file: string, source: string): Item & ItemPage {
  const { index, page } = splitItem(file, source);
  const item = parseIndex(index);
  return { ...item, ...parsePage(file, page, item) };
}

/** The `##` sections a type must have. */
const REQUIRED: Partial<Record<ItemType, string[]>> = {
  // What to do too, when there's anything to do: not every yes asks something of you.
  "can-i": ["Why"],
  decision: ["The options", "Things to weigh", "When to decide"],
};

/** A card or a term is a paragraph or two: no headings, and no longer than this. */
const SHORT = 1200;

/** Where a body's shape breaks its type's rules. */
function checkShape(type: ItemType, body: string): string[] {
  const headings = Array.from(body.matchAll(/^(#{1,6}) +(.+?)\s*$/gm), (m) => ({ level: m[1]!.length, text: m[2]! }));
  const sections = headings.filter((h) => h.level === 2).map((h) => h.text);
  if (type === "card" || type === "term") {
    const problems = headings.length > 0 ? [`a ${type} has no headings`] : [];
    if (body.length > SHORT) problems.push(`a ${type} stays short, ${SHORT} characters at most (this is ${body.length})`);
    return problems;
  }
  if (type === "symptom") {
    const [first, ...levels] = sections;
    if (first !== "What's usual") return ["a symptom opens with ## What's usual"];
    if (headings.some((h) => h.level !== 2)) return ["a symptom's sections are all ## headings"];
    const at = levels.map((l) => (SYMPTOM_LEVELS as readonly string[]).indexOf(l));
    const bad = levels.filter((_, i) => at[i] === -1);
    if (bad.length > 0) return [`a symptom's levels are ${SYMPTOM_LEVELS.map((l) => `## ${l}`).join(", ")}; not ${bad.map((b) => `## ${b}`).join(", ")}`];
    if (at.some((n, i) => i > 0 && n <= at[i - 1]!)) return ["a symptom's levels run most urgent first, each once"];
    return [];
  }
  const missing = (REQUIRED[type] ?? []).filter((s) => !sections.includes(s));
  return missing.length > 0 ? [`a ${type} has ${missing.map((s) => `## ${s}`).join(", ")}`] : [];
}

function toItem(fm: IndexFrontmatter, variables: string[]): Item {
  const [from, to] = fm.weeks ?? [null, null];
  const fields = {
    id: fm.id,
    title: fm.title,
    type: fm.type,
    topic: fm.topic,
    ask: fm.ask ?? null,
    aliases: fm.aliases,
    summary: fm.summary ?? null,
    who: fm.who ?? null,
    stakes: fm.stakes ?? null,
    verdict: fm.verdict ?? null,
    decideBy: fm.decide_by ?? null,
    surprise: fm.surprise || fm.type === "card",
    private: fm.private,
    discreet: fm.discreet,
    draft: fm.draft,
    when: fm.when,
    extra: fm.extra ?? null,
    variables,
    tasks:
      from === null || to === null
        ? []
        : [
            ...fm.tasks.map((t) => ({
              id: t.id,
              title: t.title,
              opens: t.opens ?? from,
              due: t.due ?? to,
              deadline: (typeof t.deadline === "object" ? t.deadline.week : t.deadline) ?? null,
              deadlineFrom: typeof t.deadline === "object" ? { fact: t.deadline.before, weeks: t.deadline.weeks } : null,
              who: t.who,
              keeps: t.keeps ?? null,
              itemId: fm.id,
              origin: "built-in" as const,
            })),
            ...decideTask(fm, from),
          ],
    lines: fm.lines.map((l) => ({
      id: l.id,
      title: l.title,
      listId: l.list,
      section: l.section,
      when: l.when,
      taskId: l.task ?? null,
      itemId: fm.id,
      origin: "built-in" as const,
    })),
    origin: "built-in" as const,
  };
  return from === null || to === null ? { ...fields, from: null, to: null } : { ...fields, from, to };
}

/**
 * A decision with a week to decide by, from its source, asks you to decide: a task
 * from its first week, best by that week, for whom it's written. Its id is the
 * decision's with `decide-` before it, so a tick stays put.
 */
function decideTask(fm: IndexFrontmatter, from: Week): Task[] {
  if (fm.decide_by === undefined) return [];
  return [
    {
      id: `decide-${fm.id}`,
      title: `Decide: ${fm.title}`,
      opens: from,
      due: fm.decide_by,
      deadline: null,
      deadlineFrom: null,
      who: fm.who ?? "together",
      keeps: null,
      itemId: fm.id,
      origin: "built-in",
    },
  ];
}

/** Ids unique across items, their tasks and their lines. */
function checkIds(items: readonly Item[]) {
  const seen = new Map<string, string>();
  for (const item of items) {
    for (const id of [item.id, ...item.tasks.map((t) => t.id), ...item.lines.map((l) => l.id)]) {
      const other = seen.get(id);
      if (other) throw new ContentError(item.id, `id "${id}" is also used by ${other}`);
      seen.set(id, item.id);
    }
  }
}

/** Every index half into items, checking ids are unique across items and tasks. */
export function indexAll(halves: readonly IndexHalf[]): Item[] {
  const items = halves.map(parseIndex);
  checkIds(items);
  return items;
}

/** Every file into items, whole: ids unique across items and tasks, and every related id an item. */
export function parseAll(files: Record<string, string>): (Item & ItemPage)[] {
  const items = Object.entries(files).map(([file, source]) => parseItem(file, source));
  checkIds(items);
  const ids = new Set(items.map((i) => i.id));
  for (const item of items) {
    const dangling = item.related.filter((r) => !ids.has(r) || r === item.id);
    if (dangling.length > 0) throw new ContentError(item.id, `related names no other item: ${dangling.join(", ")}`);
  }
  return items;
}
