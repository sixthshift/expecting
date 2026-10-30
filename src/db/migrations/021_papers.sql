-- Results and papers: a result, a letter or referral, a plan, a record or
-- summary, or something else, kept by either of you. Shared, as notes are.
-- Expecting keeps a paper and finds it; it never reads it, so nothing here
-- says what a paper says: what it is, its name, the Library entry it's about,
-- the date on it, a few words, and whether it's kept handy.
--
-- Its pages are uploads (020): one PDF, or a photo a page, in order. A page
-- points at its upload, so the file store's sweep finds it; deleting the
-- paper deletes its pages, and the server drops their uploads.

CREATE TABLE `paper` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`item_id` text,
	`day` text NOT NULL,
	`note` text,
	`handy` integer DEFAULT false NOT NULL,
	`by` text REFERENCES `person`(`id`) ON DELETE SET NULL,
	`created_at` text NOT NULL,
	`edited_by` text REFERENCES `person`(`id`) ON DELETE SET NULL,
	`edited_at` text,
	CONSTRAINT "paper_kind" CHECK("paper"."kind" IN ('result', 'letter', 'plan', 'record', 'other')),
	CONSTRAINT "paper_title" CHECK(length(trim("paper"."title")) > 0),
	CONSTRAINT "paper_note" CHECK("paper"."note" IS NULL OR length(trim("paper"."note")) > 0)
);
CREATE INDEX `paper_day` ON `paper` (`day`);

CREATE TABLE `paper_page` (
	`paper_id` text NOT NULL REFERENCES `paper`(`id`) ON DELETE CASCADE,
	`position` integer NOT NULL,
	`file_id` text NOT NULL REFERENCES `upload`(`id`),
	PRIMARY KEY(`paper_id`, `position`),
	CONSTRAINT "paper_page_position" CHECK("paper_page"."position" >= 0)
);
CREATE UNIQUE INDEX `paper_page_file` ON `paper_page` (`file_id`);
