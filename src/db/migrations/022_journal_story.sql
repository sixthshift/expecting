-- The Journal as a story. A note can be a letter to the baby: a `kind` of
-- entry beside notes and movements, which needs its words as a note does.
-- Rebuilt rather than altered: SQLite can't change a check.
--
-- The firsts (src/lib/firsts.ts): one marked on its day, or put aside (a
-- suggestion said no to, `day` null), and each of you's own words for it.
-- And when each of you last opened the Journal, for "since you looked".

CREATE TABLE `journal_entry_new` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`day` text NOT NULL,
	`time` text,
	`body` text NOT NULL,
	`different` integer DEFAULT false NOT NULL,
	`by` text REFERENCES `person`(`id`) ON DELETE SET NULL,
	`created_at` text NOT NULL,
	`edited_by` text REFERENCES `person`(`id`) ON DELETE SET NULL,
	`edited_at` text,
	CONSTRAINT "journal_entry_kind" CHECK(`kind` IN ('note', 'movement', 'letter')),
	CONSTRAINT "journal_entry_body" CHECK(`kind` = 'movement' OR length(trim(`body`)) > 0),
	CONSTRAINT "journal_entry_different" CHECK(`kind` = 'movement' OR `different` = 0)
);

INSERT INTO `journal_entry_new` (`id`, `kind`, `day`, `time`, `body`, `different`, `by`, `created_at`, `edited_by`, `edited_at`)
	SELECT `id`, `kind`, `day`, `time`, `body`, `different`, `by`, `created_at`, `edited_by`, `edited_at` FROM `journal_entry`;

DROP TABLE `journal_entry`;
ALTER TABLE `journal_entry_new` RENAME TO `journal_entry`;

CREATE INDEX `journal_entry_day` ON `journal_entry` (`day`);

CREATE TABLE `first_mark` (
	`key` text PRIMARY KEY NOT NULL,
	`day` text,
	`by` text REFERENCES `person`(`id`) ON DELETE SET NULL,
	`created_at` text NOT NULL
);

CREATE TABLE `first_words` (
	`key` text NOT NULL REFERENCES `first_mark`(`key`) ON DELETE CASCADE,
	`by` text NOT NULL REFERENCES `person`(`id`) ON DELETE CASCADE,
	`body` text NOT NULL,
	`edited_at` text NOT NULL,
	PRIMARY KEY (`key`, `by`),
	CONSTRAINT "first_words_body" CHECK(length(trim(`body`)) > 0)
);

CREATE TABLE `journal_seen` (
	`person_id` text PRIMARY KEY NOT NULL REFERENCES `person`(`id`) ON DELETE CASCADE,
	`seen_at` text NOT NULL
);
