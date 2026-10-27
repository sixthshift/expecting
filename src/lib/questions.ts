// A question for the next appointment: open until asked, then kept with the answer.

export type Question = { id: string; text: string; answer: string | null; askedAt: string | null; createdAt: string };
