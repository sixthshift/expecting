-- Three things left behind by changes that came after them.
--
-- "Since you looked" is gone from the Journal, and with it what it kept.
DROP TABLE `journal_seen`;

-- A first is only ever marked on its day: putting one aside is gone, so a
-- mark always has its day. Rebuilt with its words (which point at it), so
-- dropping the old table cascades to nothing; any put aside are let go.
CREATE TABLE `first_mark_new` (
	`key` text PRIMARY KEY NOT NULL,
	`day` text NOT NULL,
	`by` text REFERENCES `person`(`id`) ON DELETE SET NULL,
	`created_at` text NOT NULL
);
INSERT INTO `first_mark_new` SELECT `key`, `day`, `by`, `created_at` FROM `first_mark` WHERE `day` IS NOT NULL;

CREATE TABLE `first_words_new` (
	`key` text NOT NULL REFERENCES `first_mark_new`(`key`) ON DELETE CASCADE,
	`by` text NOT NULL REFERENCES `person`(`id`) ON DELETE CASCADE,
	`body` text NOT NULL,
	`edited_at` text NOT NULL,
	PRIMARY KEY (`key`, `by`),
	CONSTRAINT "first_words_body" CHECK(length(trim(`body`)) > 0)
);
INSERT INTO `first_words_new` SELECT `key`, `by`, `body`, `edited_at` FROM `first_words` WHERE `key` IN (SELECT `key` FROM `first_mark_new`);

DROP TABLE `first_words`;
DROP TABLE `first_mark`;
ALTER TABLE `first_mark_new` RENAME TO `first_mark`;
ALTER TABLE `first_words_new` RENAME TO `first_words`;

-- The shared password from before accounts is no one's any more: whoever was
-- carried over with it keeps it as their own, changed in Settings like any.
ALTER TABLE `person` DROP COLUMN `password_set_at`;
