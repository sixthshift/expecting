-- Appointments (docs/product/planner.md, Appointments): what, the day, and
-- perhaps the time, the place and notes. One-off; nothing repeats. Its week
-- is worked out on read, from the due date, like a Journal entry's.

CREATE TABLE `appointment` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`day` text NOT NULL,
	`time` text,
	`place` text,
	`notes` text,
	`by` text REFERENCES `person`(`id`) ON DELETE SET NULL,
	`created_at` text NOT NULL,
	`edited_by` text REFERENCES `person`(`id`) ON DELETE SET NULL,
	`edited_at` text,
	CONSTRAINT "appointment_title" CHECK(length(trim("appointment"."title")) > 0)
);
CREATE INDEX `appointment_day` ON `appointment` (`day`);
