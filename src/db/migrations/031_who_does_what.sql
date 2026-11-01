-- Who does what (docs/plan-extras.md, part 3): each of you's answer to each
-- newborn job (JOBS in src/lib/jobs.ts), from where you stand: me, you or
-- together. A job's id is from the code, so it isn't a foreign key; the
-- answer goes with its person.

CREATE TABLE `job_pick` (
	`job_id` text NOT NULL,
	`person_id` text NOT NULL REFERENCES `person`(`id`) ON DELETE CASCADE,
	`pick` text NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`job_id`, `person_id`),
	CONSTRAINT "job_pick_pick" CHECK("job_pick"."pick" IN ('me', 'you', 'together'))
);
