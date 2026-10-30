-- The household password, chosen on the first visit: its argon2id hash, one
-- row. Before, it was a hash in EXPECTING_PASSWORD_HASH.

CREATE TABLE `password` (
	`id` integer PRIMARY KEY NOT NULL,
	`hash` text NOT NULL,
	`set_at` text NOT NULL,
	CONSTRAINT "password_single_row" CHECK("password"."id" = 1)
);
