-- Logged-in browsers: the hash of each session cookie's token.

CREATE TABLE `session` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`last_seen_at` text NOT NULL
);
