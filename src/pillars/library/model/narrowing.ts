import type { Topic, Verdict } from "../../../content/schema";
import type { Door } from "../../../lib/library/doors";

/** What a shelf is narrowed by, as the Library's search params hold it. */
export type Narrowing = { door?: Door; topic?: Topic; verdict?: Verdict; for?: "partner" };
