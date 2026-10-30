-- Uploads, and the photos that show them. An upload is a file kept for a
-- record, whatever the record: its bytes are in DATA_DIR/uploads/<id>/ (the
-- original, and for a picture a display copy and a thumbnail), and this row
-- says what it is. Its type is sniffed from its first bytes. A record points
-- at its upload, and deleting the record deletes it.
--
-- A photo is the first such record: a bump photo, a scan, or something else,
-- on its day, kept by either of you. Shared, as notes are.

CREATE TABLE `upload` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`size` integer NOT NULL,
	`width` integer,
	`height` integer,
	`display` integer DEFAULT false NOT NULL,
	`thumb` integer DEFAULT false NOT NULL,
	`by` text REFERENCES `person`(`id`) ON DELETE SET NULL,
	`created_at` text NOT NULL,
	CONSTRAINT "upload_type" CHECK("upload"."type" IN ('image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf')),
	CONSTRAINT "upload_size" CHECK("upload"."size" > 0)
);

CREATE TABLE `photo` (
	`id` text PRIMARY KEY NOT NULL,
	`file_id` text NOT NULL REFERENCES `upload`(`id`),
	`kind` text NOT NULL,
	`day` text NOT NULL,
	`time` text,
	`caption` text,
	`by` text REFERENCES `person`(`id`) ON DELETE SET NULL,
	`created_at` text NOT NULL,
	`edited_by` text REFERENCES `person`(`id`) ON DELETE SET NULL,
	`edited_at` text,
	CONSTRAINT "photo_kind" CHECK("photo"."kind" IN ('bump', 'scan', 'other')),
	CONSTRAINT "photo_caption" CHECK("photo"."caption" IS NULL OR length(trim("photo"."caption")) > 0)
);
CREATE UNIQUE INDEX `photo_file` ON `photo` (`file_id`);
CREATE INDEX `photo_day` ON `photo` (`day`);
