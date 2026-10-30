-- How you're feeling: a step (rough … great), with words and a sentence if
-- you want them, on a day and a time, by one of you. The step is shared;
-- the words and the note are sent only to the person they're about, and
-- only they can change or delete it. Theirs alone, so it goes with them.

CREATE TABLE `feeling` (
	`id` text PRIMARY KEY NOT NULL,
	`by` text NOT NULL REFERENCES `person`(`id`) ON DELETE CASCADE,
	`day` text NOT NULL,
	`time` text,
	`step` text NOT NULL,
	`words` text DEFAULT '[]' NOT NULL,
	`note` text,
	`created_at` text NOT NULL,
	CONSTRAINT "feeling_step" CHECK("feeling"."step" IN ('rough', 'low', 'okay', 'good', 'great')),
	CONSTRAINT "feeling_words" CHECK(json_valid("feeling"."words") AND json_type("feeling"."words") = 'array'),
	CONSTRAINT "feeling_note" CHECK("feeling"."note" IS NULL OR length(trim("feeling"."note")) > 0)
);
CREATE INDEX `feeling_day` ON `feeling` (`day`);
