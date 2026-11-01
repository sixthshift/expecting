// Who does what (docs/plan-extras.md, part 3): the newborn jobs, each answered
// by each of you on your own phone as me, you or together. Neither sees the
// other's answer to a job until both have given one; then a job is settled
// (you said the same) or one to talk about. Kept on trust: who's holding the
// phone is a choice, not a login, so it's for the two of you, never a secret.

/** Your answer to a job, from where you stand: you'll do it, the other will, or both of you. */
export const PICKS = ["me", "you", "together"] as const;
export type Pick = (typeof PICKS)[number];

export const JOB_GROUPS = {
  nights: "Nights",
  care: "The baby",
  house: "The house",
  admin: "The admin",
  people: "People",
} as const;
export type JobGroup = keyof typeof JOB_GROUPS;

export type Job = { id: string; title: string; group: JobGroup };

/** The jobs, in the order they're dealt. Ids are stored: never rename one. */
export const JOBS: readonly Job[] = [
  { id: "night-wakes", title: "Getting up when the baby wakes in the night", group: "nights" },
  { id: "night-feeds", title: "Night feeds, or bringing the baby for one", group: "nights" },
  { id: "early-mornings", title: "The early mornings, so the other can sleep in", group: "nights" },
  { id: "nappies", title: "Nappies", group: "care" },
  { id: "bath-time", title: "Bath time", group: "care" },
  { id: "settling", title: "Settling the baby to sleep", group: "care" },
  { id: "bottles", title: "Washing and sterilising bottles and pump parts", group: "care" },
  { id: "washing", title: "The washing", group: "house" },
  { id: "cooking", title: "Cooking dinner", group: "house" },
  { id: "groceries", title: "The groceries", group: "house" },
  { id: "cleaning", title: "Cleaning and tidying", group: "house" },
  { id: "pets", title: "Feeding and walking the pets", group: "house" },
  { id: "register-birth", title: "Registering the birth", group: "admin" },
  { id: "medicare-centrelink", title: "Medicare, Centrelink and the payments", group: "admin" },
  { id: "appointments", title: "Booking the baby's checks and vaccinations", group: "admin" },
  { id: "bills", title: "The bills", group: "admin" },
  { id: "visitors", title: "Answering visitors and messages", group: "people" },
  { id: "updates", title: "Keeping the family up to date", group: "people" },
];

export function isJobId(id: string): boolean {
  return JOBS.some((j) => j.id === id);
}

/** What the server shows this phone: each job's answers, the other's only once both have answered. */
export type JobAnswer = { jobId: string; mine: Pick | null; theirs: Pick | null };
export type JobsView = {
  answers: JobAnswer[];
  /** How many jobs the other has answered, though not which or how. */
  theirCount: number;
  /** Whether there's another of you to play with. */
  together: boolean;
};

/** The other's answer, turned to where you stand: their "me" is your "you". */
export function turned(theirs: Pick): Pick {
  return theirs === "me" ? "you" : theirs === "you" ? "me" : "together";
}

/** A job both have answered: settled (who, from where you stand) or one to talk about (what each said, from where you stand). */
export type Outcome = { job: Job; agreed: true; who: Pick } | { job: Job; agreed: false; mine: Pick; theirs: Pick };

/** The jobs both have answered, in their order, settled or not. */
export function outcomes(answers: readonly JobAnswer[]): Outcome[] {
  return JOBS.flatMap((job) => {
    const a = answers.find((x) => x.jobId === job.id);
    if (!a?.mine || !a.theirs) return [];
    const theirs = turned(a.theirs);
    return [a.mine === theirs ? { job, agreed: true as const, who: a.mine } : { job, agreed: false as const, mine: a.mine, theirs }];
  });
}

/** The jobs you haven't answered, in order: the deck. */
export function toAnswer(answers: readonly JobAnswer[]): Job[] {
  return JOBS.filter((job) => !answers.find((a) => a.jobId === job.id)?.mine);
}

/** How many of your answers wait for the other's. */
export function waiting(answers: readonly JobAnswer[]): number {
  return answers.filter((a) => a.mine && !a.theirs).length;
}

/** An answer in words, from where you stand: "You", the other's name, or "Together". */
export function said(pick: Pick, other: string): string {
  return pick === "me" ? "You" : pick === "you" ? other : "Together";
}
