-- What each of you has read in the Library (docs/product/library.md, Read):
-- an entry's id (no foreign key: entries are files, like `task_tick`) and when
-- you first opened it. Yours alone, and never a private entry's, which the
-- privacy middleware refuses.

CREATE TABLE `item_read` (
	`person_id` text NOT NULL REFERENCES `person`(`id`) ON DELETE CASCADE,
	`item_id` text NOT NULL,
	`read_at` text NOT NULL,
	PRIMARY KEY(`person_id`, `item_id`)
);
