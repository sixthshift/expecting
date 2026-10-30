-- Sickness and cravings: being sick (queasy, threw up, or can't keep fluids
-- down), a craving, or going off something, on its day and time, kept by
-- either of you. Shared, as notes are: either of you can change any. Its own
-- table, as its fields are its own: `how` only for sickness, `what` only for
-- a craving or something gone off.

CREATE TABLE `appetite_entry` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`day` text NOT NULL,
	`time` text,
	`how` text,
	`what` text,
	`note` text,
	`by` text REFERENCES `person`(`id`) ON DELETE SET NULL,
	`created_at` text NOT NULL,
	`edited_by` text REFERENCES `person`(`id`) ON DELETE SET NULL,
	`edited_at` text,
	CONSTRAINT "appetite_entry_kind" CHECK("appetite_entry"."kind" IN ('sick', 'craving', 'off')),
	CONSTRAINT "appetite_entry_how" CHECK(("appetite_entry"."kind" = 'sick' AND "appetite_entry"."how" IS NOT NULL AND "appetite_entry"."how" IN ('queasy', 'vomited', 'fluids')) OR ("appetite_entry"."kind" <> 'sick' AND "appetite_entry"."how" IS NULL)),
	CONSTRAINT "appetite_entry_what" CHECK(("appetite_entry"."kind" = 'sick' AND "appetite_entry"."what" IS NULL) OR ("appetite_entry"."kind" <> 'sick' AND "appetite_entry"."what" IS NOT NULL AND length(trim("appetite_entry"."what")) > 0)),
	CONSTRAINT "appetite_entry_note" CHECK("appetite_entry"."note" IS NULL OR length(trim("appetite_entry"."note")) > 0)
);
CREATE INDEX `appetite_entry_day` ON `appetite_entry` (`day`);
