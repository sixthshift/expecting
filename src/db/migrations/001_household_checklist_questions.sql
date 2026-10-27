-- The household's settings, the checklist's state and the appointment questions.

CREATE TABLE `household` (
	`id` integer PRIMARY KEY NOT NULL,
	`due_date` text,
	`birth_date` text,
	`updated_at` text NOT NULL,
	CONSTRAINT "household_single_row" CHECK("household"."id" = 1)
);

CREATE TABLE `task_tick` (
	`task_id` text PRIMARY KEY NOT NULL,
	`ticked_at` text NOT NULL
);

CREATE TABLE `own_task` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`phase` text NOT NULL,
	`week` integer,
	`created_at` text NOT NULL
);

CREATE TABLE `question` (
	`id` text PRIMARY KEY NOT NULL,
	`text` text NOT NULL,
	`answer` text,
	`asked_at` text,
	`created_at` text NOT NULL
);
