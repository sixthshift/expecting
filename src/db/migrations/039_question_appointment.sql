-- Each question is for one appointment (docs/product/planner.md, Questions):
-- open, it waits for that one; asked, it is that appointment's record of what
-- you asked and what you were told. An appointment deleted leaves its
-- questions for none, to be moved to another.

ALTER TABLE `question` ADD `appointment_id` text REFERENCES `appointment`(`id`) ON DELETE SET NULL;
CREATE INDEX `question_appointment` ON `question` (`appointment_id`);
