-- A question a week (docs/plan-extras.md, part 3): each of you's answer to a
-- week's question (WEEKLY in src/lib/weekly.ts). The week is the question's
-- key; the answer goes with its person.

CREATE TABLE `weekly_answer` (
	`week` integer NOT NULL,
	`person_id` text NOT NULL REFERENCES `person`(`id`) ON DELETE CASCADE,
	`body` text NOT NULL,
	`answered_at` text NOT NULL,
	PRIMARY KEY(`week`, `person_id`),
	CONSTRAINT "weekly_answer_week" CHECK("weekly_answer"."week" BETWEEN 1 AND 42),
	CONSTRAINT "weekly_answer_body" CHECK(length(trim("weekly_answer"."body")) > 0)
);
