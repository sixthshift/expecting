import type { Node } from "@markdoc/markdoc";
import { parse as parseYaml } from "yaml";
import type { Slot } from "../lib/timeline";
import { parseBody } from "./markdoc";
import { type Frontmatter, frontmatterSchema, type Item } from "./schema";

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export class ContentError extends Error {
  constructor(file: string, problem: string) {
    super(`${file}: ${problem}`);
    this.name = "ContentError";
  }
}

/** One content file into an item. Throws a ContentError naming the file on any problem. */
export function parseItem(file: string, source: string): Item {
  const match = FRONTMATTER.exec(source);
  if (!match) throw new ContentError(file, "no frontmatter block between --- lines");

  let raw: unknown;
  try {
    raw = parseYaml(match[1]!);
  } catch (error) {
    throw new ContentError(file, `frontmatter is not YAML: ${(error as Error).message}`);
  }

  const parsed = frontmatterSchema.safeParse(raw);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; ");
    throw new ContentError(file, problems);
  }

  const body = match[2]!.trim();
  if (body.length === 0) throw new ContentError(file, "the body is empty");
  const { ast, problems } = parseBody(body);
  if (problems.length > 0) throw new ContentError(file, `in the body, ${problems.join("; ")}`);
  return toItem(parsed.data, body, ast);
}

function toItem(fm: Frontmatter, body: string, doc: Node): Item {
  const at = (week: number): Slot => (fm.phase === "before" ? { phase: "before" } : { phase: fm.phase, week });
  const [from, to] = fm.weeks ?? [0, 0];
  return {
    id: fm.id,
    title: fm.title,
    from: at(from),
    to: at(to),
    category: fm.category,
    surprise: fm.surprise,
    draft: fm.draft,
    source: fm.source ?? null,
    checked: fm.checked ?? null,
    when: fm.when,
    body,
    doc,
    tasks: fm.tasks.map((t) => ({ id: t.id, title: t.title, due: at(t.due ?? to), itemId: fm.id, origin: "built-in" })),
    origin: "built-in",
  };
}

/** Every file into items, checking ids are unique across items and tasks. */
export function parseAll(files: Record<string, string>): Item[] {
  const items = Object.entries(files).map(([file, source]) => parseItem(file, source));
  const seen = new Map<string, string>();
  for (const item of items) {
    for (const id of [item.id, ...item.tasks.map((t) => t.id)]) {
      const other = seen.get(id);
      if (other) throw new ContentError(item.id, `id "${id}" is also used by ${other}`);
      seen.set(id, item.id);
    }
  }
  return items;
}
