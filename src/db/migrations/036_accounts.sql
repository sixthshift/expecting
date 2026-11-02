-- Two accounts (docs/plan-accounts.md): each of you logs in as yourself, with
-- your own password, in place of one shared password and a cookie saying who
-- is holding the phone.
--
-- The shared password's hash is carried to everyone already here, with no
-- set_at: you log in with it once under your own name, then choose your own.
-- Sessions were no one's, so they go and every phone logs in once more.

ALTER TABLE `person` ADD `password_hash` text;
ALTER TABLE `person` ADD `password_set_at` text;
UPDATE `person` SET `password_hash` = (SELECT `hash` FROM `password` WHERE `id` = 1);
DROP TABLE `password`;

DROP TABLE `session`;
CREATE TABLE `session` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`person_id` text NOT NULL REFERENCES `person`(`id`) ON DELETE CASCADE,
	`created_at` text NOT NULL,
	`last_seen_at` text NOT NULL
);
CREATE INDEX `session_person` ON `session` (`person_id`);

-- A link to join (the other place) or to choose a new password (a reset, for
-- `person_id`), made by one of you; only its code's SHA-256 is kept.
CREATE TABLE `invite` (
	`code_hash` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`person_id` text REFERENCES `person`(`id`) ON DELETE CASCADE,
	`by` text NOT NULL REFERENCES `person`(`id`) ON DELETE CASCADE,
	`created_at` text NOT NULL,
	`expires_at` text NOT NULL,
	CONSTRAINT "invite_kind" CHECK("invite"."kind" IN ('join', 'reset')),
	CONSTRAINT "invite_whose" CHECK(("invite"."kind" = 'reset') = ("invite"."person_id" IS NOT NULL))
);

-- Two of you at most, one in each role. A trigger, not a unique index, so a
-- database from before, which may hold more, still opens; only new people are refused.
CREATE TRIGGER `person_two_at_most` BEFORE INSERT ON `person`
WHEN (SELECT count(*) FROM `person`) >= 2 OR EXISTS (SELECT 1 FROM `person` WHERE `role` = NEW.`role`)
BEGIN
	SELECT RAISE(ABORT, 'two people at most, one in each role');
END;
