// A question for an appointment: open until asked, then kept with the answer,
// that appointment's record of what you asked and what you were told. It
// remembers the Library entry it was asked from, if any, and who added it.
// An appointment deleted leaves its questions for none, until they're moved.

import type { ISODate } from "../dates";
import { type Appointment, splitAppointments } from "./appointments";

export type Question = {
  id: string;
  text: string;
  answer: string | null;
  askedAt: string | null;
  itemId: string | null;
  by: string | null;
  createdAt: string;
  /** The appointment it is for, or was asked at; null once that one was deleted. */
  appointmentId: string | null;
};

/** A question's words as compared for the same one twice: case, spacing and punctuation aside. */
export function sameWords(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/** The questions still to ask at `appointmentId`, oldest first. */
export function openFor(questions: readonly Question[], appointmentId: string): Question[] {
  return questions.filter((q) => q.askedAt === null && q.appointmentId === appointmentId);
}

/** Whether `text` is already waiting at `appointmentId`, in the same words. */
export function waitingAt(questions: readonly Question[], appointmentId: string | null, text: string): boolean {
  const words = sameWords(text);
  return appointmentId !== null && words.length > 0 && openFor(questions, appointmentId).some((q) => sameWords(q.text) === words);
}

/** An appointment and its questions, open or asked. */
type ForAppointment = { appointment: Appointment; questions: Question[] };

/**
 * The questions by the appointment they're for: those still ahead with what's
 * to ask there (the next always, the rest once they have one), earliest first;
 * those gone with questions left unasked there, latest first (they stay until
 * moved); open ones for none (their appointment deleted); and what was asked,
 * by the appointment it was asked at, latest first, those at none last.
 */
export function questionsByAppointment(
  questions: readonly Question[],
  appointments: readonly Appointment[],
  today: ISODate
): { ahead: ForAppointment[]; missed: ForAppointment[]; forNone: Question[]; asked: ForAppointment[]; askedAtNone: Question[] } {
  const { ahead, past } = splitAppointments(appointments, today);
  const kept = new Set(appointments.map((a) => a.id));
  const open = questions.filter((q) => q.askedAt === null);
  const asked = questions.filter((q) => q.askedAt !== null);
  const of = (list: readonly Question[], a: Appointment) => list.filter((q) => q.appointmentId === a.id);
  return {
    ahead: ahead.map((a) => ({ appointment: a, questions: of(open, a) })).filter((g, i) => i === 0 || g.questions.length > 0),
    missed: past.map((a) => ({ appointment: a, questions: of(open, a) })).filter((g) => g.questions.length > 0),
    forNone: open.filter((q) => q.appointmentId === null || !kept.has(q.appointmentId)),
    asked: [...[...ahead].reverse(), ...past].map((a) => ({ appointment: a, questions: of(asked, a) })).filter((g) => g.questions.length > 0),
    askedAtNone: asked.filter((q) => q.appointmentId === null || !kept.has(q.appointmentId)),
  };
}
