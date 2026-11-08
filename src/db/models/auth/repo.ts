import { and, eq, gt, lt, ne } from "drizzle-orm";
import { Repo } from "../../connection/client";
import { invite, session } from "./schema";

/** How long a session lives without being used. Matches the cookie's lifetime. */
export const SESSION_DAYS = 400;
const DAY_MS = 86_400_000;
/** last_seen_at is written at most this often, not on every request. */
const TOUCH_MS = DAY_MS;

function sha256(text: string): string {
  return new Bun.CryptoHasher("sha256").update(text).digest("hex");
}

export class SessionRepo extends Repo {
  /** Start a session as `personId`; returns the token for the cookie. */
  create(personId: string, now: Date = new Date()): string {
    const token = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url");
    const at = now.toISOString();
    this.db
      .insert(session)
      .values({ tokenHash: sha256(token), personId, createdAt: at, lastSeenAt: at })
      .run();
    return token;
  }

  /** Whose live session `token` is; null without one. A live one is kept alive; an expired one is removed. */
  check(token: string, now: Date = new Date()): string | null {
    const tokenHash = sha256(token);
    const row = this.db.select().from(session).where(eq(session.tokenHash, tokenHash)).get();
    if (!row) return null;
    const idle = now.getTime() - Date.parse(row.lastSeenAt);
    if (idle > SESSION_DAYS * DAY_MS) {
      this.db.delete(session).where(eq(session.tokenHash, tokenHash)).run();
      return null;
    }
    if (idle > TOUCH_MS) this.db.update(session).set({ lastSeenAt: now.toISOString() }).where(eq(session.tokenHash, tokenHash)).run();
    return row.personId;
  }

  end(token: string): void {
    this.db
      .delete(session)
      .where(eq(session.tokenHash, sha256(token)))
      .run();
  }

  /** End every session of `personId`'s, but the one with `except` as its token, if given. */
  endAllFor(personId: string, except?: string): void {
    const whose = eq(session.personId, personId);
    this.db
      .delete(session)
      .where(except ? and(whose, ne(session.tokenHash, sha256(except))) : whose)
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

export type InviteKind = "join" | "reset";
/** A live invite: to join, or (a reset) for `personId` to choose a new password. */
export type Invite = { kind: InviteKind; personId: string | null; by: string; expiresAt: string };

/** How long each kind lives: a week to join, a day to reset. */
export const INVITE_DAYS: Record<InviteKind, number> = { join: 7, reset: 1 };

/**
 * Crockford's base32, without the letters that read as others: the code is
 * read off one screen and typed into another.
 */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const CODE_LENGTH = 12;

/** A code to send: 12 characters (60 bits), shown in threes, `K7Q-MP3-XD9-VA2`. */
function newCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH));
  const chars = Array.from(bytes, (b) => ALPHABET[b % 32]);
  return chars.join("").replace(/(.{3})(?!$)/g, "$1-");
}

/** A code as typed, made what it was: case, spaces and dashes don't matter, and O, I and L read as 0, 1 and 1. */
export function normaliseCode(typed: string): string {
  const plain = typed.toUpperCase().replace(/[\s-]/g, "").replace(/O/g, "0").replace(/[IL]/g, "1");
  return plain.replace(/(.{3})(?!$)/g, "$1-");
}

export class InviteRepo extends Repo {
  /**
   * A new invite of `kind` (for `personId`, a reset), made by `by`; returns
   * its code. Any other of the same kind (and person) ends: one at a time.
   */
  create(kind: InviteKind, by: string, personId: string | null = null, now: Date = new Date()): { code: string; expiresAt: string } {
    const code = newCode();
    const expiresAt = new Date(now.getTime() + INVITE_DAYS[kind] * DAY_MS).toISOString();
    this.db.transaction((tx) => {
      tx.delete(invite)
        .where(personId ? and(eq(invite.kind, kind), eq(invite.personId, personId)) : eq(invite.kind, kind))
        .run();
      tx.insert(invite)
        .values({ codeHash: sha256(normaliseCode(code)), kind, personId, by, createdAt: now.toISOString(), expiresAt })
        .run();
    });
    return { code, expiresAt };
  }

  /** The live invite `code` is, of `kind`; null for none, or one expired. */
  find(code: string, kind: InviteKind, now: Date = new Date()): Invite | null {
    const row = this.db
      .select({ kind: invite.kind, personId: invite.personId, by: invite.by, expiresAt: invite.expiresAt })
      .from(invite)
      .where(and(eq(invite.codeHash, sha256(normaliseCode(code))), eq(invite.kind, kind), gt(invite.expiresAt, now.toISOString())))
      .get();
    return row ?? null;
  }

  /** Use `code` up: it works once. */
  use(code: string): void {
    this.db
      .delete(invite)
      .where(eq(invite.codeHash, sha256(normaliseCode(code))))
      .run();
  }

  /** Remove invites past their time. */
  prune(now: Date = new Date()): void {
    this.db.delete(invite).where(lt(invite.expiresAt, now.toISOString())).run();
  }
}
