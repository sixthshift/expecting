-- A question remembers where it came from and who added it: the Library
-- entry it was asked from (an item id, not a foreign key: items are files),
-- and the person holding the phone. Both null for questions from before.

ALTER TABLE `question` ADD `item_id` text;
ALTER TABLE `question` ADD `by` text REFERENCES `person`(`id`) ON DELETE SET NULL;
