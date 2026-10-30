-- Something has happened: while this one row is here, Expecting is quiet for
-- both of you. What happened (a loss, or hard news), who said so and
-- when. Bringing Expecting back deletes it; nothing else is touched, so the
-- tasks and ticks put aside come back as they were.

CREATE TABLE `quiet` (
	`id` integer PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`set_by` text REFERENCES `person`(`id`) ON DELETE SET NULL,
	`set_at` text NOT NULL,
	CONSTRAINT "quiet_single_row" CHECK("quiet"."id" = 1),
	CONSTRAINT "quiet_kind" CHECK("quiet"."kind" IN ('loss', 'news'))
);
