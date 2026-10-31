-- Your people (docs/plan-extras.md, part 2): the people you know, kept by
-- either of you, each with what a view sets (when they visit, when they hear
-- of the birth, what they'll help with and their day on the meal train);
-- what each gave, and whether they've been thanked; and the words for the
-- birth, written ahead (one row).

CREATE TABLE `circle_person` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`note` text,
	`visit` text,
	`hears` text,
	`help` text,
	`meal_day` text,
	`by` text REFERENCES `person`(`id`) ON DELETE SET NULL,
	`created_at` text NOT NULL,
	CONSTRAINT "circle_person_name" CHECK(length(trim("circle_person"."name")) > 0),
	CONSTRAINT "circle_person_note" CHECK("circle_person"."note" IS NULL OR length(trim("circle_person"."note")) > 0),
	CONSTRAINT "circle_person_visit" CHECK("circle_person"."visit" IS NULL OR "circle_person"."visit" IN ('hospital', 'first-weeks', 'not-yet')),
	CONSTRAINT "circle_person_hears" CHECK("circle_person"."hears" IS NULL OR "circle_person"."hears" IN ('first', 'next', 'everyone')),
	CONSTRAINT "circle_person_help" CHECK("circle_person"."help" IS NULL OR length(trim("circle_person"."help")) > 0)
);

CREATE TABLE `circle_gift` (
	`id` text PRIMARY KEY NOT NULL,
	`person_id` text NOT NULL REFERENCES `circle_person`(`id`) ON DELETE CASCADE,
	`what` text NOT NULL,
	`thanked_at` text,
	`by` text REFERENCES `person`(`id`) ON DELETE SET NULL,
	`created_at` text NOT NULL,
	CONSTRAINT "circle_gift_what" CHECK(length(trim("circle_gift"."what")) > 0)
);
CREATE INDEX `circle_gift_person` ON `circle_gift` (`person_id`);

CREATE TABLE `announcement` (
	`id` integer PRIMARY KEY NOT NULL,
	`body` text NOT NULL,
	`by` text REFERENCES `person`(`id`) ON DELETE SET NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT "announcement_one" CHECK("announcement"."id" = 1),
	CONSTRAINT "announcement_body" CHECK(length(trim("announcement"."body")) > 0)
);
