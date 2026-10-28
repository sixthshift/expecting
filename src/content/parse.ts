import type { Node } from "@markdoc/markdoc";
import { parse as parseYaml } from "yaml";
import { parseBody } from "./markdoc";
import { type Frontmatter, frontmatterSchema, type Item } from "./schema";

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export class ContentError extends Error {
  constructor(file: string, problem: string) {
    super(`${file}: ${problem}`);
    this.name = "ContentError";
  }
}

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

/** A content file's frontmatter, as YAML, and its body. Throws a ContentError naming the file if either is missing or malformed. */
export function readFrontmatter(file: string, source: string): { raw: unknown; body: string } {
  const match = FRONTMATTER.exec(source);
  if (!match) throw new ContentError(file, "no frontmatter block between --- lines");
  try {
    return { raw: parseYaml(match[1]!), body: match[2]!.trim() };
  } catch (error) {
    throw new ContentError(file, `frontmatter is not YAML: ${(error as Error).message}`);
  }
}

/** One content file, `items/<id>.md`, into an item. Throws a ContentError naming the file on any problem. */
export function parseItem(file: string, source: string): Item {
  const id = idOf(file);
  const { raw, body } = readFrontmatter(file, source);
  const parsed = frontmatterSchema.safeParse(raw);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; ");
    throw new ContentError(file, problems);
  }

  if (parsed.data.id !== id) throw new ContentError(file, `id "${parsed.data.id}" must be the file's name, ${id}`);

  if (body.length === 0) throw new ContentError(file, "the body is empty");
  const { ast, problems } = parseBody(body);
  if (problems.length > 0) throw new ContentError(file, `in the body, ${problems.join("; ")}`);
  return toItem(parsed.data, body, ast);
}

function toItem(fm: Frontmatter, body: string, doc: Node): Item {
  const [from, to] = fm.weeks;
  return {
    id: fm.id,
    title: fm.title,
    from,
    to,
    category: fm.category,
    surprise: fm.surprise,
    draft: fm.draft,
    source: fm.source ?? null,
    checked: fm.checked ?? null,
    when: fm.when,
    body,
    doc,
    tasks: fm.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      opens: t.opens ?? from,
      due: t.due ?? to,
      deadline: (typeof t.deadline === "object" ? t.deadline.week : t.deadline) ?? null,
      deadlineFrom: typeof t.deadline === "object" ? { fact: t.deadline.before, weeks: t.deadline.weeks } : null,
      who: t.who,
      itemId: fm.id,
      origin: "built-in",
    })),
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
