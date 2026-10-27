import type { Database } from "bun:sqlite";
import { eq, lt } from "drizzle-orm";
import { orm } from "../../connection/client";
import { session } from "./schema";

/** How long a session lives without being used. Matches the cookie's lifetime. */
export const SESSION_DAYS = 400;
const DAY_MS = 86_400_000;
/** last_seen_at is written at most this often, not on every request. */
const TOUCH_MS = DAY_MS;

function hashToken(token: string): string {
  return new Bun.CryptoHasher("sha256").update(token).digest("hex");
}

export class SessionRepo {
  private readonly db;

  constructor(db: Database) {
    this.db = orm(db);
  }

  /** Start a session; returns the token for the cookie. */
  create(now: Date = new Date()): string {
    const token = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url");
    const at = now.toISOString();
    this.db
      .insert(session)
      .values({ tokenHash: hashToken(token), createdAt: at, lastSeenAt: at })
      .run();
    return token;
  }

  /** Whether `token` is a live session. A live one is kept alive; an expired one is removed. */
  check(token: string, now: Date = new Date()): boolean {
    const tokenHash = hashToken(token);
    const row = this.db.select().from(session).where(eq(session.tokenHash, tokenHash)).get();
    if (!row) return false;
    const idle = now.getTime() - Date.parse(row.lastSeenAt);
    if (idle > SESSION_DAYS * DAY_MS) {
      this.db.delete(session).where(eq(session.tokenHash, tokenHash)).run();
      return false;
    }
    if (idle > TOUCH_MS) this.db.update(session).set({ lastSeenAt: now.toISOString() }).where(eq(session.tokenHash, tokenHash)).run();
    return true;
  }

  end(token: string): void {
    this.db
      .delete(session)
      .where(eq(session.tokenHash, hashToken(token)))
      .run();
  }

  /** Remove sessions idle past their lifetime. */
  prune(now: Date = new Date()): void {
    this.db
      .delete(session)
      .where(lt(session.lastSeenAt, new Date(now.getTime() - SESSION_DAYS * DAY_MS).toISOString()))
      .run();
  }
}
