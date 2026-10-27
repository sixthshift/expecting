-- The phase before a pregnancy is "preconception", not "before": the same word
-- the code uses for it everywhere, as a slot, an app and a URL key.
UPDATE `own_task` SET `phase` = 'preconception' WHERE `phase` = 'before';

-- The first onboarding question is "expecting" (yes, or not yet), not "stage":
-- "stage" is kept for the stages of labour. Its answer moves to the new key.
UPDATE `household`
SET `profile` = json_set(
  json_remove(`profile`, '$.stage'),
  '$.expecting',
  CASE json_extract(`profile`, '$.stage') WHEN 'pregnant' THEN 'yes' WHEN 'trying' THEN 'not-yet' END
)
WHERE json_extract(`profile`, '$.stage') IN ('pregnant', 'trying');

-- Any other value there was never a valid answer: drop it.
UPDATE `household` SET `profile` = json_remove(`profile`, '$.stage') WHERE json_extract(`profile`, '$.stage') IS NOT NULL;
