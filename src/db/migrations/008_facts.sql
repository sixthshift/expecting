-- The household's answers become facts: a row per answer, kept, so a fact has
-- a history (who answered, and when) and can be about one of you. The latest
-- row for a question and its subject is the fact; a row with no value is a
-- question skipped or an answer cleared. Which questions exist is still
-- content's business (content/facts.yaml), so a new one is not a migration.
-- The answers so far move across as the household's, answered when the
-- household was last saved.

CREATE TABLE `answer` (
	`id` text PRIMARY KEY NOT NULL,
	`question` text NOT NULL CHECK (length(`question`) > 0),
	`about` text NOT NULL CHECK (`about` IN ('household', 'carrying', 'partner')),
	`value` text,
	`answered_by` text REFERENCES `person`(`id`) ON DELETE SET NULL,
	`answered_at` text NOT NULL
);

CREATE INDEX `answer_latest` ON `answer` (`question`, `about`, `answered_at`);

INSERT INTO `answer` (`id`, `question`, `about`, `value`, `answered_by`, `answered_at`)
SELECT lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', 1 + (abs(random()) % 4), 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6))),
	j.`key`, 'household', j.`value`, NULL, h.`updated_at`
FROM `household` h, json_each(h.`profile`) j
WHERE j.`type` = 'text';

ALTER TABLE `household` DROP COLUMN `profile`;
