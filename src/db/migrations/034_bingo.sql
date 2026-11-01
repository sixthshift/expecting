-- Pregnancy bingo (docs/plan-extras.md, part 3): a card each, its 24 squares
-- in order (a JSON array of ids from SQUARES in src/lib/bingo.ts, the free
-- centre left out), and the squares marked, each with its day and a few
-- words. Both go with their person.

CREATE TABLE `bingo_card` (
	`person_id` text PRIMARY KEY NOT NULL REFERENCES `person`(`id`) ON DELETE CASCADE,
	`squares` text NOT NULL,
	`dealt_at` text NOT NULL,
	CONSTRAINT "bingo_card_squares" CHECK(json_valid("bingo_card"."squares") AND json_array_length("bingo_card"."squares") = 24)
);

CREATE TABLE `bingo_mark` (
	`person_id` text NOT NULL REFERENCES `person`(`id`) ON DELETE CASCADE,
	`square_id` text NOT NULL,
	`day` text NOT NULL,
	`note` text,
	`marked_at` text NOT NULL,
	PRIMARY KEY(`person_id`, `square_id`),
	CONSTRAINT "bingo_mark_note" CHECK("bingo_mark"."note" IS NULL OR length(trim("bingo_mark"."note")) > 0)
);
