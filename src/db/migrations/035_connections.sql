-- Claude, or another MCP client, connected to Expecting (docs/plan-mcp.md).
-- A client registers itself (OAuth dynamic registration); a connection is
-- one of you allowing it, at /connect; codes and tokens belong to their
-- connection, stored only as SHA-256, so disconnecting drops them all.

CREATE TABLE `oauth_client` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`redirect_uris` text NOT NULL,
	`created_at` text NOT NULL,
	CONSTRAINT "oauth_client_redirect_uris" CHECK(json_valid("oauth_client"."redirect_uris") AND json_array_length("oauth_client"."redirect_uris") > 0)
);

CREATE TABLE `connection` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL REFERENCES `oauth_client`(`id`) ON DELETE CASCADE,
	`person_id` text NOT NULL REFERENCES `person`(`id`) ON DELETE CASCADE,
	`created_at` text NOT NULL,
	`last_used_at` text NOT NULL
);

CREATE TABLE `oauth_code` (
	`code_hash` text PRIMARY KEY NOT NULL,
	`connection_id` text NOT NULL REFERENCES `connection`(`id`) ON DELETE CASCADE,
	`challenge` text NOT NULL,
	`redirect_uri` text NOT NULL,
	`expires_at` text NOT NULL
);

CREATE TABLE `oauth_token` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`connection_id` text NOT NULL REFERENCES `connection`(`id`) ON DELETE CASCADE,
	`kind` text NOT NULL,
	`expires_at` text NOT NULL,
	CONSTRAINT "oauth_token_kind" CHECK("oauth_token"."kind" IN ('access', 'refresh'))
);
CREATE INDEX `oauth_token_connection` ON `oauth_token` (`connection_id`);
