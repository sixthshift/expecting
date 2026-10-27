-- Boy, girl, or don't know (which covers keeping it a surprise). Chooses the theme.

ALTER TABLE `household` ADD COLUMN `baby` text DEFAULT 'unknown' NOT NULL CHECK (`baby` IN ('boy', 'girl', 'unknown'));
