-- The names game: names either of you adds, and each person's own vote on
-- each. A name is a match only when both of you like it, so nobody has to
-- admit to the name the other would hate. Votes are private: the app only
-- ever shows you your own votes, and the matches.

CREATE TABLE `baby_name` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL CHECK (length(trim(`name`)) > 0),
	`added_by` text REFERENCES `person`(`id`) ON DELETE SET NULL,
	`added_at` text NOT NULL
);

CREATE UNIQUE INDEX `baby_name_once` ON `baby_name` (lower(`name`));

CREATE TABLE `name_vote` (
	`name_id` text NOT NULL REFERENCES `baby_name`(`id`) ON DELETE CASCADE,
	`person_id` text NOT NULL REFERENCES `person`(`id`) ON DELETE CASCADE,
	`liked` integer NOT NULL CHECK (`liked` IN (0, 1)),
	`voted_at` text NOT NULL,
	PRIMARY KEY (`name_id`, `person_id`)
);
