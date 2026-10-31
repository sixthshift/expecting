-- It's time (docs/plan-its-time.md). A start: one go at it, opened when the
-- waters break or the contractions start, ended "We're there" or "False
-- alarm, we're home"; its waters' time and colour, and when you left. Its
-- contractions, timed by either phone. The last things ticked for it, by key
-- (a bag line's id, or one of the page's own); and your own last things, kept
-- between starts.

CREATE TABLE `labour_start` (
	`id` text PRIMARY KEY NOT NULL,
	`started_at` text NOT NULL,
	`by` text REFERENCES `person`(`id`) ON DELETE SET NULL,
	`waters_at` text,
	`waters` text,
	`left_at` text,
	`ended_at` text,
	`ended` text,
	CONSTRAINT "labour_start_waters" CHECK("labour_start"."waters" IS NULL OR ("labour_start"."waters_at" IS NOT NULL AND "labour_start"."waters" IN ('clear', 'green-brown-blood', 'unsure'))),
	CONSTRAINT "labour_start_ended" CHECK(("labour_start"."ended" IS NULL) = ("labour_start"."ended_at" IS NULL) AND ("labour_start"."ended" IS NULL OR "labour_start"."ended" IN ('there', 'home')))
);
-- One start under way at a time.
CREATE UNIQUE INDEX `labour_start_open` ON `labour_start` (`ended_at` IS NULL) WHERE `ended_at` IS NULL;

CREATE TABLE `contraction` (
	`id` text PRIMARY KEY NOT NULL,
	`start_id` text NOT NULL REFERENCES `labour_start`(`id`) ON DELETE CASCADE,
	`started_at` text NOT NULL,
	`ended_at` text,
	`note` text,
	`by` text REFERENCES `person`(`id`) ON DELETE SET NULL,
	CONSTRAINT "contraction_note" CHECK("contraction"."note" IS NULL OR length(trim("contraction"."note")) > 0)
);
CREATE INDEX `contraction_start` ON `contraction` (`start_id`);

CREATE TABLE `start_tick` (
	`start_id` text NOT NULL REFERENCES `labour_start`(`id`) ON DELETE CASCADE,
	`key` text NOT NULL,
	`by` text REFERENCES `person`(`id`) ON DELETE SET NULL,
	`at` text NOT NULL,
	PRIMARY KEY(`start_id`, `key`)
);

CREATE TABLE `start_line` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`by` text REFERENCES `person`(`id`) ON DELETE SET NULL,
	`created_at` text NOT NULL,
	CONSTRAINT "start_line_title" CHECK(length(trim("start_line"."title")) > 0)
);
