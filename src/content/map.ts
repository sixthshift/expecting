// The Library's map, content/map/<area>.yaml: every entry the Library should
// hold, before it is written (content/map/README.md). Nothing in the app reads
// it; the tests check it, so the plan stays sound as it grows.

import { parse as parseYaml } from "yaml";
import { z } from "zod";
import { WEEKS } from "../lib/timeline";

export const MAP_TYPES = ["can-i", "symptom", "moment", "guide", "card", "decision", "term", "payment"] as const;

export const MAP_TOPICS = [
  "food",
  "drink",
  "medicines",
  "activities",
  "body",
  "baby",
  "tests",
  "appointments",
  "care",
  "labour",
  "birth",
  "after-the-birth",
  "feeding",
  "mental-health",
  "relationships",
  "loss",
  "money",
  "work",
  "paperwork",
  "gear",
  "partner",
  "travel",
  "special-circumstances",
] as const;

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "ids are lower-case words joined by hyphens");
const week = z.number().int().min(WEEKS.first).max(WEEKS.last);

export const mapEntrySchema = z
  .object({
    id: slug,
    title: z.string().min(1),
    type: z.enum(MAP_TYPES),
    topic: z.enum(MAP_TOPICS),
    ask: z.string().min(1).optional(),
    aliases: z.array(z.coerce.string()).default([]),
    weeks: z.union([week, z.tuple([week, week])]).optional(),
    who: z.enum(["carrying", "partner", "together"]).optional(),
    priority: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    stakes: z.enum(["high", "medium", "low"]),
    covers: z.array(z.string()).min(1),
    // Empty only where no open source says it; the entry's notes say so, and it waits for one.
    sources: z.array(z.object({ title: z.string().min(1), url: z.string().url() }).strict()),
    related: z.array(slug).default([]),
    exists: z.string().optional(),
    notes: z.string().optional(),
  })
  .strict();

export type MapEntry = z.infer<typeof mapEntrySchema> & { file: string };

/** Each file into its entries. Throws, naming the file and entry, on anything malformed. */
export function parseMap(files: Record<string, string>): MapEntry[] {
  return Object.entries(files).flatMap(([file, source]) => {
    const list = parseYaml(source);
    if (!Array.isArray(list)) throw new Error(`${file}: expected a list of entries`);
    return list.map((raw, i) => {
      const parsed = mapEntrySchema.safeParse(raw);
      if (!parsed.success)
        throw new Error(`${file}: entry ${i} (${raw?.id ?? "no id"}): ${parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ")}`);
      return { ...parsed.data, file };
    });
  });
}
