// The extras, from extras.data.ts: the optional parts of Expecting you
// turn on. Pure, and bundled into the client like the items.

import { z } from "zod";
import { WEEKS } from "../../../lib/timeline";
import { EXTRA_LIST } from "./extras.data";
import { checkWhen, type WhenInput, whenSchema } from "./facts";

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
    /** Only when your answers fit, as an item's `when`: siblings, `{ firstBaby: "no" }`. */
    when: whenSchema.default({}),
    /** What it brings beyond its items, if anything: a tool, and where it is, as it reads after "And". Shown wherever it's offered, so the extras that change the app stand out. */
    tool: z.string().min(1).optional(),
  })
  .strict()
  .superRefine((e, ctx) => {
    for (const message of checkWhen(e.when)) ctx.addIssue({ code: "custom", path: ["when"], message });
  });

export type Extra = z.output<typeof extraSchema>;

/** An extra as extras.data.ts writes it; checked by `parseExtras`. */
export type ExtraInput = {
  readonly id: string;
  readonly name: string;
  readonly pitch: string;
  readonly group: ExtraGroup;
  readonly onboarding?: boolean;
  readonly offer: number;
  readonly when?: WhenInput;
  readonly tool?: string;
};

/** An extra's id, as extras.data.ts has it. */
export type ExtraId = (typeof EXTRA_LIST)[number]["id"];

/** The extras, checked. Throws on a bad extra or a repeated id. */
export function parseExtras(list: readonly unknown[]): Extra[] {
  const extras = z.array(extraSchema).parse(list);
  const seen = new Set<string>();
  for (const e of extras) {
    if (seen.has(e.id)) throw new Error(`extra "${e.id}" appears twice`);
    seen.add(e.id);
  }
  return extras;
}

export const EXTRAS: readonly Extra[] = parseExtras(EXTRA_LIST);

export function extra(id: ExtraId): Extra;
export function extra(id: string): Extra | undefined;
export function extra(id: string): Extra | undefined {
  return EXTRAS.find((e) => e.id === id);
}
