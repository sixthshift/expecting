-- The household's answers to the questions in content/profile.yaml, as a JSON
-- object of question id to answer id. JSON, not columns: the questions are
-- content, and adding one shouldn't need a migration.

ALTER TABLE `household` ADD COLUMN `profile` text DEFAULT '{}' NOT NULL CHECK (json_valid(`profile`) AND json_type(`profile`) = 'object');
