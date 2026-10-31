import type { Database } from "bun:sqlite";
import { and, asc, eq, isNull, sql } from "drizzle-orm";
import type { ISODate } from "../../../lib/dates";
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
   * The game as `personId` sees it: their own votes, the shortlist and their latest superlike. Every name
   * either of you added is in it; a deck name only once they've voted on it, or someone else liked it. A
   * deck name the other passed stays out, so the order of their deck never says what the other has seen.
   * The shortlist is the names everyone likes, and those anyone superliked, starred but never saying whose.
   */
  view(personId: string): NamesView {
    const rows = this.db
      .select({ id: babyName.id, name: babyName.name, deck: babyName.fromDeck, offAt: babyName.offAt })
      .from(babyName)
      .orderBy(asc(babyName.addedAt), asc(sql`${babyName}.rowid`))
      .all();
    const votes = this.db
      .select({ id: nameVote.nameId, by: nameVote.personId, liked: nameVote.liked, superOn: nameVote.superOn, at: nameVote.votedAt })
      .from(nameVote)
      .all();
    const people = this.db.select({ n: sql<number>`count(*)` }).from(person).get()?.n ?? 0;
    const mine = new Map(votes.filter((v) => v.by === personId).map((v) => [v.id, v.liked]));
    const likes = new Map<string, number>();
    for (const v of votes) if (v.liked) likes.set(v.id, (likes.get(v.id) ?? 0) + 1);
    const othersLike = new Set(votes.filter((v) => v.liked && v.by !== personId).map((v) => v.id));
    const starred = new Set(votes.filter((v) => v.superOn !== null).map((v) => v.id));
    const named = new Map(rows.map((r) => [r.id, r.name]));
    const latest = votes
      .filter((v) => v.by === personId && v.superOn !== null)
      .sort((a, b) => (a.superOn! < b.superOn! ? 1 : a.superOn! > b.superOn! ? -1 : 0))[0];
    const on = rows.filter((r) => r.offAt === null);
    return {
      names: rows
        .filter((r) => !r.deck || mine.has(r.id) || othersLike.has(r.id))
        .map(({ id, name, deck }) => ({ id, name, deck, mine: mine.get(id) ?? null })),
      shortlist: on
        .filter((r) => starred.has(r.id) || (people > 1 && (likes.get(r.id) ?? 0) >= people))
        .map(({ id, name }) => ({ id, name, star: starred.has(id) })),
      off: rows.filter((r) => r.offAt !== null).map(({ id, name }) => ({ id, name })),
      superliked: latest ? { name: named.get(latest.id) ?? "", on: latest.superOn as ISODate } : null,
      together: people > 1,
    };
  }

  /** The id of a name in the game, whatever its case. */
  private find(name: string): string | undefined {
    return this.db.select({ id: babyName.id }).from(babyName).where(sql`lower(${babyName.name}) = lower(${name})`).get()?.id;
  }

  /** Whether a name is in the game, whatever its case. */
  has(name: string): boolean {
    return this.find(name) !== undefined;
  }

  /** Add a name, by the id the phone gave it; one already in the game (whatever its case: the same save, sent twice, too) is left as it is. Returns its id. */
  add(name: string, addedBy: string | null, now: Date = new Date(), id: string = crypto.randomUUID()): string {
    const existing = this.find(name);
    if (existing) {
      // Typed again after it was taken off the shortlist: it's back in the game.
      this.db.update(babyName).set({ offAt: null }).where(eq(babyName.id, existing)).run();
      return existing;
    }
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

  /** Like or pass a name, or change your mind. A superlike passed on is just a pass, and gives the day's back. */
  vote(nameId: string, personId: string, liked: boolean, now: Date = new Date()): void {
    this.db
      .insert(nameVote)
      .values({ nameId, personId, liked, votedAt: now.toISOString() })
      .onConflictDoUpdate({
        target: [nameVote.nameId, nameVote.personId],
        set: liked ? { liked, votedAt: now.toISOString() } : { liked, superOn: null, votedAt: now.toISOString() },
      })
      .run();
  }

  /**
   * Superlike a name: a like that puts it on the shortlist without the other, one a day (`day`, the phone's
   * date). A deck name gets its row as a swipe would. The same superlike sent twice is the one; a second
   * name the same day is turned away. Returns the name's id, or null when the day's superlike is used.
   */
  superlike(name: string, personId: string, day: ISODate, now: Date = new Date(), id: string = crypto.randomUUID()): string | null {
    const used = this.db
      .select({ id: nameVote.nameId })
      .from(nameVote)
      .where(and(eq(nameVote.personId, personId), eq(nameVote.superOn, day)))
      .get();
    const nameId = this.find(name) ?? id;
    if (used && used.id !== nameId) return null;
    if (nameId === id) this.db.insert(babyName).values({ id, name, addedBy: null, addedAt: now.toISOString(), fromDeck: true }).run();
    this.db
      .insert(nameVote)
      .values({ nameId, personId, liked: true, superOn: day, votedAt: now.toISOString() })
      .onConflictDoUpdate({ target: [nameVote.nameId, nameVote.personId], set: { liked: true, superOn: day, votedAt: now.toISOString() } })
      .run();
    return nameId;
  }

  /** Take a name off the shortlist: it leaves the game, with its votes kept, and isn't dealt again. */
  takeOff(nameId: string, now: Date = new Date()): void {
    this.db
      .update(babyName)
      .set({ offAt: now.toISOString() })
      .where(and(eq(babyName.id, nameId), isNull(babyName.offAt)))
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
}
