-- The extras the household has chosen: the optional parts of Expecting (a baby
-- shower, the babymoon, food safety) that are off until someone turns them on.
-- A row per extra once anyone has decided, on or off, with who and when; no
-- row is undecided, so This week can still offer it. Which extras exist is
-- content's business (content/extras.yaml), so a new one is not a migration.

CREATE TABLE `extra` (
	`id` text PRIMARY KEY NOT NULL CHECK (length(`id`) > 0),
	`on` integer NOT NULL CHECK (`on` IN (0, 1)),
	`changed_by` text REFERENCES `person`(`id`) ON DELETE SET NULL,
	`changed_at` text NOT NULL
);
