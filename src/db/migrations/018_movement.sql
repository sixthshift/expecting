-- Movements join the Journal: a `kind` of entry beside notes, on its day and
-- time, by whoever felt it. Its words are optional, so the body may be empty
-- for a movement (a note still needs words), and `different` marks one felt
-- as slower, weaker or stopped. Rebuilt rather than altered: SQLite can't
-- change a check.

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
	CONSTRAINT "journal_entry_kind" CHECK(`kind` IN ('note', 'movement')),
	CONSTRAINT "journal_entry_body" CHECK(`kind` = 'movement' OR length(trim(`body`)) > 0),
	CONSTRAINT "journal_entry_different" CHECK(`kind` = 'movement' OR `different` = 0)
);

INSERT INTO `journal_entry_new` (`id`, `kind`, `day`, `time`, `body`, `by`, `created_at`, `edited_by`, `edited_at`)
	SELECT `id`, `kind`, `day`, `time`, `body`, `by`, `created_at`, `edited_by`, `edited_at` FROM `journal_entry`;

DROP TABLE `journal_entry`;
ALTER TABLE `journal_entry_new` RENAME TO `journal_entry`;

CREATE INDEX `journal_entry_day` ON `journal_entry` (`day`);
