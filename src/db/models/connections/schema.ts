import { sql } from "drizzle-orm";
import { check, index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { person } from "../people/schema";

/** An MCP client that registered itself (OAuth dynamic registration): its name and where it may be sent back to. */
export const oauthClient = sqliteTable(
  "oauth_client",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    /** A JSON array of URLs, at least one. */
    redirectUris: text("redirect_uris").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (t) => [check("oauth_client_redirect_uris", sql`json_valid(${t.redirectUris}) AND json_array_length(${t.redirectUris}) > 0`)]
);

/** One of you letting a client in, at /connect. What it saves is by that person. */
export const connection = sqliteTable("connection", {
  id: text("id").primaryKey(),
  clientId: text("client_id")
    .notNull()
    .references(() => oauthClient.id, { onDelete: "cascade" }),
  personId: text("person_id")
    .notNull()
    .references(() => person.id, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull(),
  lastUsedAt: text("last_used_at").notNull(),
});

/** A code handed back from /connect, swapped once for tokens. Only its SHA-256 is kept, with the PKCE challenge it must answer. */
export const oauthCode = sqliteTable("oauth_code", {
  codeHash: text("code_hash").primaryKey(),
  connectionId: text("connection_id")
    .notNull()
    .references(() => connection.id, { onDelete: "cascade" }),
  challenge: text("challenge").notNull(),
  redirectUri: text("redirect_uri").notNull(),
  expiresAt: text("expires_at").notNull(),
});

/** An access or refresh token, as its SHA-256. */
export const oauthToken = sqliteTable(
  "oauth_token",
  {
    tokenHash: text("token_hash").primaryKey(),
    connectionId: text("connection_id")
      .notNull()
      .references(() => connection.id, { onDelete: "cascade" }),
    kind: text("kind", { enum: ["access", "refresh"] }).notNull(),
    expiresAt: text("expires_at").notNull(),
  },
  (t) => [check("oauth_token_kind", sql`${t.kind} IN ('access', 'refresh')`), index("oauth_token_connection").on(t.connectionId)]
);
