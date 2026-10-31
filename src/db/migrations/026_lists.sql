-- The lists (docs/plan-lists.md). Your own lists beside the built-in ones; your
-- own lines, on either; and a mark on any line, built-in or yours: arranged,
-- got or not needed (or none, still to get, with only words), how it was got,
-- a few words, and who set it last. A
-- line's id is a built-in line's from content/ or an own line's UUID, and a
-- list's a built-in list's or an own list's, so neither is a foreign key.

CREATE TABLE `own_list` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`by` text REFERENCES `person`(`id`) ON DELETE SET NULL,
	`created_at` text NOT NULL,
	CONSTRAINT "own_list_title" CHECK(length(trim("own_list"."title")) > 0)
);

CREATE TABLE `own_line` (
	`id` text PRIMARY KEY NOT NULL,
	`list_id` text NOT NULL,
	`title` text NOT NULL,
	`section` text,
	`by` text REFERENCES `person`(`id`) ON DELETE SET NULL,
	`created_at` text NOT NULL,
	CONSTRAINT "own_line_title" CHECK(length(trim("own_line"."title")) > 0)
);
CREATE INDEX `own_line_list` ON `own_line` (`list_id`);

CREATE TABLE `list_mark` (
	`line_id` text PRIMARY KEY NOT NULL,
	`state` text,
	`how` text,
	`note` text,
	`by` text REFERENCES `person`(`id`) ON DELETE SET NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT "list_mark_state" CHECK("list_mark"."state" IS NULL OR "list_mark"."state" IN ('arranged', 'got', 'not-needed')),
	CONSTRAINT "list_mark_how" CHECK("list_mark"."how" IS NULL OR ("list_mark"."state" = 'got' AND "list_mark"."how" IN ('bought', 'borrowed', 'hired', 'second-hand', 'given'))),
	CONSTRAINT "list_mark_note" CHECK("list_mark"."note" IS NULL OR length(trim("list_mark"."note")) > 0),
	CONSTRAINT "list_mark_something" CHECK("list_mark"."state" IS NOT NULL OR "list_mark"."note" IS NOT NULL)
);
