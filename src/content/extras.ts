// The extras, from content/extras.yaml: the optional parts of Expecting a
// household turns on. Pure, and bundled into the client like the items.

import { parse as parseYaml } from "yaml";
import { z } from "zod";
import source from "../../content/extras.yaml?raw";
import { WEEKS } from "../lib/timeline";
import { checkWhen, whenSchema } from "./facts";

/** How settings groups the extras, in this order. */
export const EXTRA_GROUPS = {
  celebrate: "Celebrating",
  people: "Family and friends",
  ready: "Getting ready",
  "you-two": "For you two",
  money: "Money",
} as const;

export type ExtraGroup = keyof typeof EXTRA_GROUPS;

const extraSchema = z
  .object({
    /** Items name it as `extra: <id>`. */
    id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "an extra's id is lower-case words joined by hyphens"),
    name: z.string().min(1),
    /** One line: what turning it on gets you. */
    pitch: z.string().min(1),
    /** Where settings shows it. */
    group: z.enum(Object.keys(EXTRA_GROUPS) as [ExtraGroup, ...ExtraGroup[]]),
    /** Also offered in onboarding, not only on This week in its week. */
    onboarding: z.boolean().default(false),
    /** The week This week suggests it, if nobody has decided. */
    offer: z.number().int().min(WEEKS.first).max(WEEKS.last),
    /** Only for households whose answers fit, as an item's `when`: siblings, `{ firstBaby: "no" }`. */
    when: whenSchema.default({}),
  })
  .strict()
  .superRefine((e, ctx) => {
    for (const message of checkWhen(e.when)) ctx.addIssue({ code: "custom", path: ["when"], message });
  });

export type Extra = z.output<typeof extraSchema>;

/** content/extras.yaml into extras. Throws on a bad file or a repeated id. */
export function parseExtras(text: string): Extra[] {
  const extras = z.array(extraSchema).parse(parseYaml(text));
  const seen = new Set<string>();
  for (const e of extras) {
    if (seen.has(e.id)) throw new Error(`extras.yaml: extra "${e.id}" appears twice`);
    seen.add(e.id);
  }
  return extras;
}

export const EXTRAS: readonly Extra[] = parseExtras(source);

export function extra(id: string): Extra | undefined {
  return EXTRAS.find((e) => e.id === id);
}
