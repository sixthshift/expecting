// A content file read as text: its frontmatter, as YAML, and its body. Pure,
// with no Vite in it, so the build reads the files with it too
// (src/content/vite.ts): an item is split in two there, the index every list,
// search and the timeline need, bundled up front, and the page only its own
// screen shows, loaded when it opens.

import { parse as parseYaml } from "yaml";

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export class ContentError extends Error {
  constructor(file: string, problem: string) {
    super(`${file}: ${problem}`);
    this.name = "ContentError";
  }
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

/** The frontmatter only an item's own page shows: loaded with its body when it opens. */
const PAGE_FIELDS = ["sources", "related", "checked"] as const;

/** The half of an item every list reads: its frontmatter less the page's, and the questions its body names. */
export type IndexHalf = { file: string; frontmatter: Record<string, unknown>; variables: string[] };

/** The half only its page reads. */
export type PageHalf = { frontmatter: Record<string, unknown>; body: string };

/** One item's file, split. Throws a ContentError naming the file if its frontmatter isn't a YAML mapping. */
export function splitItem(file: string, source: string): { index: IndexHalf; page: PageHalf } {
  const { raw, body } = readFrontmatter(file, source);
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) throw new ContentError(file, "frontmatter is not a mapping of fields");
  const index: Record<string, unknown> = {};
  const page: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) ((PAGE_FIELDS as readonly string[]).includes(key) ? page : index)[key] = value;
  return { index: { file, frontmatter: index, variables: variablesIn(body) }, page: { frontmatter: page, body } };
}

/** Each `$question` a body names, once: `$work.carrying` names work. */
function variablesIn(body: string): string[] {
  return [...new Set(Array.from(body.matchAll(/\$([A-Za-z_]\w*)/g), (m) => m[1]!))];
}
