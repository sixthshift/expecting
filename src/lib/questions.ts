// A question for the next appointment: open until asked, then kept with the answer.
// It remembers the Library entry it was asked from, if any, and who added it.

export type Question = {
  id: string;
  text: string;
  answer: string | null;
  askedAt: string | null;
  itemId: string | null;
  by: string | null;
  createdAt: string;
};
