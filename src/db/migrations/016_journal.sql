-- The Journal: what happens, kept. Each entry is on a day (and, if given, a
-- time), written by one of you; its week is worked out from the due date
-- when it's read, never stored. Only notes so far: the other kinds
-- (movements, moods, …) join `kind` when they come.

CREATE TABLE `journal_entry` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`day` text NOT NULL,
	`time` text,
	`body` text NOT NULL,
	`by` text REFERENCES `person`(`id`) ON DELETE SET NULL,
	`created_at` text NOT NULL,
	`edited_by` text REFERENCES `person`(`id`) ON DELETE SET NULL,
	`edited_at` text,
	CONSTRAINT "journal_entry_kind" CHECK("journal_entry"."kind" IN ('note')),
	CONSTRAINT "journal_entry_body" CHECK(length(trim("journal_entry"."body")) > 0)
);
CREATE INDEX `journal_entry_day` ON `journal_entry` (`day`);
