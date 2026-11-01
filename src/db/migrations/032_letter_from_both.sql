-- A letter to the baby from both of you, not one (docs/product/journal.md,
-- Notes and letters). Only a letter can be; a note or a movement is one
-- person's, as kept.

ALTER TABLE `journal_entry` ADD `from_both` integer DEFAULT 0 NOT NULL CHECK(`kind` = 'letter' OR `from_both` = 0);
