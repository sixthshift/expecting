-- The household table becomes settings: its one row is the due date, the
-- baby's colours and when onboarding finished, which settings owns. Rebuilt
-- rather than renamed, so its checks carry the new name too.

CREATE TABLE `settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`due_date` text,
	`baby` text DEFAULT 'unknown' NOT NULL,
	`onboarded_at` text,
	`updated_at` text NOT NULL,
	CONSTRAINT "settings_single_row" CHECK("settings"."id" = 1),
	CONSTRAINT "settings_baby" CHECK("settings"."baby" IN ('boy', 'girl', 'unknown'))
);

INSERT INTO `settings` (`id`, `due_date`, `baby`, `onboarded_at`, `updated_at`)
	SELECT `id`, `due_date`, `baby`, `onboarded_at`, `updated_at` FROM `household`;

DROP TABLE `household`;
