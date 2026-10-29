-- Emergency info: the page to open when something goes wrong, or labour starts.
-- A row per field once one of you has filled it in (the fields are fixed in
-- src/lib/emergency.ts); shared, and editable by both.

CREATE TABLE `emergency` (
	`field` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL CHECK (length(trim(`value`)) > 0),
	`changed_by` text REFERENCES `person`(`id`) ON DELETE SET NULL,
	`changed_at` text NOT NULL
);
