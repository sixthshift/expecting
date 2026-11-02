import type { Database } from "bun:sqlite";
import { and, asc, eq, gt, isNull, lt } from "drizzle-orm";
import { orm } from "../../connection/client";
import { person } from "../people/schema";
import { connection, oauthClient, oauthCode, oauthToken } from "./schema";

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;
/** A code is swapped straight away, or not at all. */
export const CODE_MS = MINUTE_MS;
/** An access token lives a day; the client refreshes it. */
export const ACCESS_MS = DAY_MS;
/** A refresh token lives as long as a session, from its last use: it is replaced each time. */
export const REFRESH_MS = 400 * DAY_MS;
/** last_used_at is written at most this often. */
const TOUCH_MS = DAY_MS;
/** A client nobody connected is forgotten after this: registering is open to anyone. */
const UNUSED_CLIENT_MS = DAY_MS;

export type Client = { id: string; name: string; redirectUris: string[] };
/** A connection as Settings lists it. */
export type Connection = { id: string; clientName: string; personId: string; personName: string; createdAt: string; lastUsedAt: string };
/** Who a token speaks for. */
export type Grant = { connectionId: string; personId: string };
export type Tokens = { accessToken: string; refreshToken: string; expiresIn: number };

function hash(secret: string): string {
  return new Bun.CryptoHasher("sha256").update(secret).digest("hex");
}

function secret(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url");
}

export class ConnectionsRepo {
  private readonly db;

  constructor(db: Database) {
    this.db = orm(db);
  }

  register(name: string, redirectUris: string[], now: Date = new Date()): Client {
    const client = { id: crypto.randomUUID(), name, redirectUris };
    this.db
      .insert(oauthClient)
      .values({ ...client, redirectUris: JSON.stringify(redirectUris), createdAt: now.toISOString() })
      .run();
    return client;
  }

  client(id: string): Client | null {
    const row = this.db.select().from(oauthClient).where(eq(oauthClient.id, id)).get();
    return row ? { id: row.id, name: row.name, redirectUris: JSON.parse(row.redirectUris) as string[] } : null;
  }

  /** Let `clientId` in as `personId`; returns the code to send back, which must be swapped with the verifier of `challenge`. */
  approve(clientId: string, personId: string, challenge: string, redirectUri: string, now: Date = new Date()): string {
    const at = now.toISOString();
    const id = crypto.randomUUID();
    const code = secret();
    this.db.transaction((tx) => {
      tx.insert(connection).values({ id, clientId, personId, createdAt: at, lastUsedAt: at }).run();
      tx.insert(oauthCode)
        .values({ codeHash: hash(code), connectionId: id, challenge, redirectUri, expiresAt: new Date(now.getTime() + CODE_MS).toISOString() })
        .run();
    });
    return code;
  }

  /**
   * Swap a code for tokens, once. Null when it is unknown, spent, expired, or
   * not this client's, or `verified` says the verifier doesn't answer its
   * challenge, or it came back to a different address.
   */
  redeem(code: string, clientId: string, redirectUri: string, verified: (challenge: string) => boolean, now: Date = new Date()): Tokens | null {
    const row = this.db
      .select({ code: oauthCode, clientId: connection.clientId })
      .from(oauthCode)
      .innerJoin(connection, eq(connection.id, oauthCode.connectionId))
      .where(eq(oauthCode.codeHash, hash(code)))
      .get();
    if (!row) return null;
    this.db.delete(oauthCode).where(eq(oauthCode.codeHash, row.code.codeHash)).run();
    const good = row.clientId === clientId && row.code.redirectUri === redirectUri && row.code.expiresAt > now.toISOString() && verified(row.code.challenge);
    return good ? this.issue(row.code.connectionId, now) : null;
  }

  /** Swap a refresh token for new ones; the old one is spent. Null when it is unknown, expired, or not this client's. */
  refresh(token: string, clientId: string, now: Date = new Date()): Tokens | null {
    const row = this.db
      .select({ token: oauthToken, clientId: connection.clientId })
      .from(oauthToken)
      .innerJoin(connection, eq(connection.id, oauthToken.connectionId))
      .where(and(eq(oauthToken.tokenHash, hash(token)), eq(oauthToken.kind, "refresh")))
      .get();
    if (!row || row.clientId !== clientId) return null;
    this.db.delete(oauthToken).where(eq(oauthToken.tokenHash, row.token.tokenHash)).run();
    return row.token.expiresAt > now.toISOString() ? this.issue(row.token.connectionId, now) : null;
  }

  /** Who a live access token speaks for; null for any other. Keeps its connection's last use. */
  check(token: string, now: Date = new Date()): Grant | null {
    const row = this.db
      .select({ connectionId: connection.id, personId: connection.personId, lastUsedAt: connection.lastUsedAt })
      .from(oauthToken)
      .innerJoin(connection, eq(connection.id, oauthToken.connectionId))
      .where(and(eq(oauthToken.tokenHash, hash(token)), eq(oauthToken.kind, "access"), gt(oauthToken.expiresAt, now.toISOString())))
      .get();
    if (!row) return null;
    if (now.getTime() - Date.parse(row.lastUsedAt) > TOUCH_MS)
      this.db.update(connection).set({ lastUsedAt: now.toISOString() }).where(eq(connection.id, row.connectionId)).run();
    return { connectionId: row.connectionId, personId: row.personId };
  }

  /** Drop a token, access or refresh (OAuth revocation): its connection stays. */
  revoke(token: string): void {
    this.db
      .delete(oauthToken)
      .where(eq(oauthToken.tokenHash, hash(token)))
      .run();
  }

  /** Every connection, oldest first. */
  list(): Connection[] {
    return this.db
      .select({
        id: connection.id,
        clientName: oauthClient.name,
        personId: connection.personId,
        personName: person.name,
        createdAt: connection.createdAt,
        lastUsedAt: connection.lastUsedAt,
      })
      .from(connection)
      .innerJoin(oauthClient, eq(oauthClient.id, connection.clientId))
      .innerJoin(person, eq(person.id, connection.personId))
      .orderBy(asc(connection.createdAt))
      .all();
  }

  /** Disconnect: the connection and its codes and tokens go. */
  disconnect(id: string): void {
    this.db.delete(connection).where(eq(connection.id, id)).run();
  }

  /** Remove spent codes and tokens, and clients registered a day ago that nobody connected. */
  prune(now: Date = new Date()): void {
    const at = now.toISOString();
    this.db.delete(oauthCode).where(lt(oauthCode.expiresAt, at)).run();
    this.db.delete(oauthToken).where(lt(oauthToken.expiresAt, at)).run();
    const unused = this.db
      .select({ id: oauthClient.id })
      .from(oauthClient)
      .leftJoin(connection, eq(connection.clientId, oauthClient.id))
      .where(and(isNull(connection.id), lt(oauthClient.createdAt, new Date(now.getTime() - UNUSED_CLIENT_MS).toISOString())))
      .all();
    for (const { id } of unused) this.db.delete(oauthClient).where(eq(oauthClient.id, id)).run();
  }

  private issue(connectionId: string, now: Date): Tokens {
    const accessToken = secret();
    const refreshToken = secret();
    this.db
      .insert(oauthToken)
      .values([
        { tokenHash: hash(accessToken), connectionId, kind: "access", expiresAt: new Date(now.getTime() + ACCESS_MS).toISOString() },
        { tokenHash: hash(refreshToken), connectionId, kind: "refresh", expiresAt: new Date(now.getTime() + REFRESH_MS).toISOString() },
      ])
      .run();
    this.db.update(connection).set({ lastUsedAt: now.toISOString() }).where(eq(connection.id, connectionId)).run();
    return { accessToken, refreshToken, expiresIn: ACCESS_MS / 1000 };
  }
}
