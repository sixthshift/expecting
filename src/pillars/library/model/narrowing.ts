import type { Item, Topic, Verdict } from "../../../content/schema";
import { behind, type Door, forPartner } from "../../../lib/library/doors";

/** What a shelf is narrowed by, as the Library's search params hold it. */
export type Narrowing = { door?: Door; topic?: Topic; verdict?: Verdict; for?: "partner" };

/** The entries a shelf narrowed by `narrowing` holds: behind its door (or in its topic), then by topic, verdict and for the partner. */
export function onShelf({ door, topic, verdict, for: who }: Narrowing, items: readonly Item[]): Item[] {
  return (door ? behind(door, items) : items)
    .filter((i) => !topic || i.topic === topic)
    .filter((i) => !verdict || i.verdict === verdict)
    .filter((i) => who !== "partner" || forPartner(i));
}
