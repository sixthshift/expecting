-- The Meal train extra joins Lining up help: a meal is one kind of help, and
-- the meal train is now one of its entries. A choice made for the meal train
-- carries over: on if either was on; Lining up help's own choice stands
-- otherwise. Then the meal train's row goes, as its id is retired.

INSERT INTO `extra` (`id`, `on`, `changed_by`, `changed_at`)
  SELECT 'help-network', `on`, `changed_by`, `changed_at` FROM `extra` WHERE `id` = 'meal-train'
  ON CONFLICT (`id`) DO UPDATE SET `on` = 1, `changed_by` = excluded.`changed_by`, `changed_at` = excluded.`changed_at`
  WHERE excluded.`on` = 1 AND `extra`.`on` = 0;

DELETE FROM `extra` WHERE `id` = 'meal-train';
