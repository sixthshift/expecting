// What the questions' and appointments' DOM tests share: the queries, the
// outbox and the toasts stood in for, over data each test sets. Imported for
// its vi.mock calls, before the components under test.
import type { ReactNode } from "react";
import { vi } from "vitest";
import { addDays, type ISODate, todayISO } from "../../../../../src/lib/dates";
import type { Appointment } from "../../../../../src/lib/planner/appointments";
import type { Question } from "../../../../../src/lib/planner/questions";

export const state = {
  questions: [] as Question[],
  appointments: [] as Appointment[],
  saved: [] as { key: string; input: unknown }[],
  toasts: [] as { title: string; action?: string; onAction?: () => void }[],
};

export function reset() {
  state.questions = [];
  state.appointments = [];
  state.saved.length = 0;
  state.toasts.length = 0;
}

/** A day `n` from today, as appointments keep it. */
const inDays = (n: number): string => addDays(todayISO(), n) as ISODate;

export function appointment(id: string, title: string, days: number): Appointment {
  return { id, title, day: inDays(days), time: null, place: null, notes: null, by: null, createdAt: "x", editedBy: null, editedAt: null };
}

export function question(id: string, text: string, appointmentId: string | null, rest: Partial<Question> = {}): Question {
  return { id, text, answer: null, askedAt: null, itemId: null, by: "p1", createdAt: "2026-10-01T00:00:00Z", appointmentId, ...rest };
}

const saves = (...keys: string[]) => Object.fromEntries(keys.map((key) => [key, { key }]));
const query =
  <T,>(data: () => T) =>
  (options?: { select?: (d: T) => unknown }) => ({ data: options?.select ? options.select(data()) : data() });

vi.mock("../../../../../src/api/rpc/questions", () => ({
  questionsSaves: saves("addQuestion", "moveQuestion", "markAsked", "reopenQuestion", "deleteQuestion"),
  useQuestionsQuery: query(() => state.questions),
}));
vi.mock("../../../../../src/api/rpc/appointments", () => ({
  appointmentsSaves: saves("addAppointment", "editAppointment", "deleteAppointment"),
  useAppointmentsQuery: query(() => state.appointments),
}));
vi.mock("../../../../../src/api/rpc/people", () => ({
  usePeopleQuery: () => ({ data: { me: { id: "p1", name: "Alex" }, people: [{ id: "p1", name: "Alex" }] } }),
}));
vi.mock("../../../../../src/app/hooks/useSave", () => ({
  useSave: (save: { key: string }) => (input: unknown) => state.saved.push({ key: save.key, input }),
}));
vi.mock("@sixthshift/design-system/overlay", () => ({ toast: (t: (typeof state.toasts)[number]) => state.toasts.push(t) }));
vi.mock("../../../../../src/content", () => ({ builtInItems: [] }));
vi.mock("../../../../../src/pillars/library/components/itemLink/ItemLink", () => ({
  ItemLink: ({ children }: { children: ReactNode }) => <a href="/library">{children}</a>,
}));
// The kit's Select stood in for by a native one: these tests are about which appointment, not the dropdown.
vi.mock("@sixthshift/design-system/select", () => ({
  Select: ({
    options,
    value,
    placeholder,
    onValueChange,
    "aria-label": label,
  }: {
    options: { value: string; label: string }[];
    value?: string;
    placeholder?: string;
    onValueChange: (v: string) => void;
    "aria-label": string;
  }) => (
    <select aria-label={label} value={value ?? ""} onChange={(e) => onValueChange(e.target.value)}>
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
}));
