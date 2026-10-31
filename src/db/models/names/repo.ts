import type { Database } from "bun:sqlite";
import { and, asc, eq, sql } from "drizzle-orm";
import type { NamesView } from "../../../lib/names";
import { orm } from "../../connection/client";
import { person } from "../people/schema";
import { babyName, nameVote } from "./schema";

export class NamesRepo {
  private readonly db;

  constructor(db: Database) {
    this.db = orm(db);
  }

  /**
   * The game as `personId` sees it: their own votes, and the names everyone likes. Every name either of
   * you added is in it; a deck name only once they've voted on it, or someone else liked it. A deck name
   * the other passed stays out, so the order of their deck never says what the other has seen.
   */
  view(personId: string): NamesView {
    const rows = this.db
      .select({ id: babyName.id, name: babyName.name, deck: babyName.fromDeck })
      .from(babyName)
      .orderBy(asc(babyName.addedAt), asc(sql`${babyName}.rowid`))
      .all();
    const votes = this.db.select({ id: nameVote.nameId, by: nameVote.personId, liked: nameVote.liked }).from(nameVote).all();
    const people = this.db.select({ n: sql<number>`count(*)` }).from(person).get()?.n ?? 0;
    const mine = new Map(votes.filter((v) => v.by === personId).map((v) => [v.id, v.liked]));
    const likes = new Map<string, number>();
    for (const v of votes) if (v.liked) likes.set(v.id, (likes.get(v.id) ?? 0) + 1);
    const othersLike = new Set(votes.filter((v) => v.liked && v.by !== personId).map((v) => v.id));
    return {
      names: rows.filter((r) => !r.deck || mine.has(r.id) || othersLike.has(r.id)).map((r) => ({ ...r, mine: mine.get(r.id) ?? null })),
      matches: rows.filter((r) => people > 1 && (likes.get(r.id) ?? 0) >= people).map(({ id, name }) => ({ id, name })),
      together: people > 1,
    };
  }

  /** The id of a name in the game, whatever its case. */
  private find(name: string): string | undefined {
    return this.db.select({ id: babyName.id }).from(babyName).where(sql`lower(${babyName.name}) = lower(${name})`).get()?.id;
  }

  /** Add a name, by the id the phone gave it; one already in the game (whatever its case: the same save, sent twice, too) is left as it is. Returns its id. */
  add(name: string, addedBy: string | null, now: Date = new Date(), id: string = crypto.randomUUID()): string {
    const existing = this.find(name);
    if (existing) return existing;
    this.db.insert(babyName).values({ id, name, addedBy, addedAt: now.toISOString() }).run();
    return id;
  }

  /**
   * Like or pass a name from the deck. Its row is made the first time anyone votes on it, by the id the
   * phone gave it; after that (or when the other's phone made it first) the name's own row takes the vote.
   */
  swipe(name: string, personId: string, liked: boolean, now: Date = new Date(), id: string = crypto.randomUUID()): string {
    const nameId = this.find(name) ?? id;
    if (nameId === id) this.db.insert(babyName).values({ id, name, addedBy: null, addedAt: now.toISOString(), fromDeck: true }).run();
    this.vote(nameId, personId, liked, now);
    return nameId;
  }

  /** Like or pass a name, or change your mind. */
  vote(nameId: string, personId: string, liked: boolean, now: Date = new Date()): void {
    this.db
      .insert(nameVote)
      .values({ nameId, personId, liked, votedAt: now.toISOString() })
      .onConflictDoUpdate({ target: [nameVote.nameId, nameVote.personId], set: { liked, votedAt: now.toISOString() } })
      .run();
  }

  /** Take back a vote, by the name (the phone may not know the row the server gave it). A deck name nobody has a vote on any more leaves the game. */
  unvote(name: string, personId: string): void {
    const nameId = this.find(name);
    if (!nameId) return;
    this.db
      .delete(nameVote)
      .where(and(eq(nameVote.nameId, nameId), eq(nameVote.personId, personId)))
      .run();
    const left = this.db.select({ n: sql<number>`count(*)` }).from(nameVote).where(eq(nameVote.nameId, nameId)).get()?.n ?? 0;
    if (left === 0)
      this.db
        .delete(babyName)
        .where(and(eq(babyName.id, nameId), eq(babyName.fromDeck, true)))
        .run();
  }

  /** Take a name out of the game, with every vote on it. */
  remove(nameId: string): void {
    this.db.delete(babyName).where(eq(babyName.id, nameId)).run();
  }
}
