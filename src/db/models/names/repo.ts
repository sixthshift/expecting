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

  /** The game as `personId` sees it: their own votes, and the names everyone likes. */
  view(personId: string): NamesView {
    const names = this.db
      .select({ id: babyName.id, name: babyName.name, mine: nameVote.liked })
      .from(babyName)
      .leftJoin(nameVote, and(eq(nameVote.nameId, babyName.id), eq(nameVote.personId, personId)))
      .orderBy(asc(babyName.addedAt), asc(sql`${babyName}.rowid`))
      .all();
    const people = this.db.select({ n: sql<number>`count(*)` }).from(person).get()?.n ?? 0;
    const liked = this.db
      .select({ id: nameVote.nameId, n: sql<number>`count(*)` })
      .from(nameVote)
      .where(eq(nameVote.liked, true))
      .groupBy(nameVote.nameId)
      .all();
    const everyone = new Set(liked.filter((l) => people > 1 && l.n >= people).map((l) => l.id));
    return {
      names: names.map((n) => ({ ...n, mine: n.mine ?? null })),
      matches: names.filter((n) => everyone.has(n.id)).map(({ id, name }) => ({ id, name })),
      together: people > 1,
    };
  }

  /** Add a name; one already in the game (whatever its case) is left as it is. Returns its id. */
  add(name: string, addedBy: string | null, now: Date = new Date()): string {
    const existing = this.db.select({ id: babyName.id }).from(babyName).where(sql`lower(${babyName.name}) = lower(${name})`).get();
    if (existing) return existing.id;
    const id = crypto.randomUUID();
    this.db.insert(babyName).values({ id, name, addedBy, addedAt: now.toISOString() }).run();
    return id;
  }

  /** Like or pass a name, or change your mind. */
  vote(nameId: string, personId: string, liked: boolean, now: Date = new Date()): void {
    this.db
      .insert(nameVote)
      .values({ nameId, personId, liked, votedAt: now.toISOString() })
      .onConflictDoUpdate({ target: [nameVote.nameId, nameVote.personId], set: { liked, votedAt: now.toISOString() } })
      .run();
  }

  /** Take a name out of the game, with every vote on it. */
  remove(nameId: string): void {
    this.db.delete(babyName).where(eq(babyName.id, nameId)).run();
  }
}
