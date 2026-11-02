import type { DatedItem, Item, Topic } from "../../../src/content/schema";

/** An entry with only what a rule reads: a moment in its one week, unless `over` says otherwise. */
export function item(id: string, from: number, topic: Topic, surprise = false): DatedItem {
  return {
    id,
    title: id,
    summary: null,
    from,
    to: from,
    type: "moment",
    topic,
    ask: null,
    aliases: [],
    who: null,
    stakes: null,
    verdict: null,
    decideBy: null,
    surprise,
    private: false,
    discreet: false,
    when: {},
    extra: null,
    variables: [],
    tasks: [],
    lines: [],
    origin: "built-in",
  };
}

export const entry = (id: string, over: Partial<Item>): Item => ({ ...item(id, 1, "body"), from: null, to: null, ...over }) as Item;
