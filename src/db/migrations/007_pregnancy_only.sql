-- Expecting is the pregnancy alone: no getting ready before it, no weeks after
-- the birth. Own tasks become pregnancy weeks (getting ready's at week 1, the
-- newborn's at week 42, where the timeline ends) and lose their phase; the
-- birth date and the "expecting yet?" answer go.

CREATE TABLE `own_task_new` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`week` integer NOT NULL CHECK (`week` BETWEEN 1 AND 42),
	`created_at` text NOT NULL
);

INSERT INTO `own_task_new` (`id`, `title`, `week`, `created_at`)
SELECT `id`, `title`,
	CASE `phase` WHEN 'pregnancy' THEN min(42, max(1, coalesce(`week`, 1))) WHEN 'postpartum' THEN 42 ELSE 1 END,
	`created_at`
FROM `own_task`;

DROP TABLE `own_task`;
ALTER TABLE `own_task_new` RENAME TO `own_task`;

ALTER TABLE `household` DROP COLUMN `birth_date`;

UPDATE `household` SET `profile` = json_remove(`profile`, '$.expecting') WHERE json_extract(`profile`, '$.expecting') IS NOT NULL;
