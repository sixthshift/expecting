-- The household's people: who is holding each phone. Not accounts: no
-- passwords, no permissions. A device remembers which person it is in a
-- cookie, so Expecting can say who logged something and speak to each of you.
-- `role` is who is (or will be) pregnant and who is the partner.

CREATE TABLE `person` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL CHECK (length(trim(`name`)) > 0),
	`role` text NOT NULL CHECK (`role` IN ('carrying', 'partner')),
	`created_at` text NOT NULL
);

-- When the household finished onboarding. A household that already has a due
-- date has, in effect, done it.
ALTER TABLE `household` ADD COLUMN `onboarded_at` text;
UPDATE `household` SET `onboarded_at` = `updated_at` WHERE `due_date` IS NOT NULL;
