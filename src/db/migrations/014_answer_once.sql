-- An answer to a question asked once is nobody's in particular, so it names
-- nobody: `about` is null, where it was 'household', and only a question
-- asked of each of you says whose. Rebuilt rather than updated, so the check
-- loses 'household' too.

CREATE TABLE `answer_new` (
	`id` text PRIMARY KEY NOT NULL,
	`question` text NOT NULL,
	`about` text,
	`value` text,
	`answered_by` text REFERENCES `person`(`id`) ON DELETE SET NULL,
	`answered_at` text NOT NULL,
	CONSTRAINT "answer_question" CHECK(length(`question`) > 0),
	CONSTRAINT "answer_about" CHECK(`about` IN ('carrying', 'partner'))
);

INSERT INTO `answer_new` (`id`, `question`, `about`, `value`, `answered_by`, `answered_at`)
	SELECT `id`, `question`, nullif(`about`, 'household'), `value`, `answered_by`, `answered_at` FROM `answer`;

DROP TABLE `answer`;
ALTER TABLE `answer_new` RENAME TO `answer`;

CREATE INDEX `answer_latest` ON `answer` (`question`, `about`, `answered_at`);
