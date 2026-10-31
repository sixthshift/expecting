-- The names game's shortlist. A name is on it when you both like it, or when
-- one of you superlikes it: a like that puts it there without the other, one a
-- day each. `super_on` is the day it was used, the phone's own date, so the day
-- turns over at its midnight. Either of you can take a name off the shortlist
-- (`off_at`): it leaves the game, and isn't dealt again.

ALTER TABLE `name_vote` ADD `super_on` text CHECK (`super_on` IS NULL OR `liked` = 1);

CREATE UNIQUE INDEX `name_vote_super_once_a_day` ON `name_vote` (`person_id`, `super_on`) WHERE `super_on` IS NOT NULL;

ALTER TABLE `baby_name` ADD `off_at` text;
