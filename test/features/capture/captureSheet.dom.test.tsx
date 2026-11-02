import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// The capture sheet, with the query cache and the outbox stood in for: what
// it offers whom, what each choice keeps, and where it says it went. A
// movement felt as different keeps the call on screen until put away, as
// does being sick and not keeping fluids down.
const SAM = { id: "sam", name: "Sam", role: "carrying" as const };
let me: typeof SAM | null = SAM;
let quiet: object | null = null;
let now: number | null = 28;
const saved: { key: string; input: unknown }[] = [];
// Sickness and cravings as kept: a new one is shown once its save is made, as the outbox does.
let appetite: object[] = [];
const toasts: { title: string }[] = [];

vi.mock("../../../src/api/rpc/journal", () => ({
  journalSaves: { addNote: { key: "addNote" }, addMovement: { key: "addMovement" } },
  useJournalQuery: () => ({ data: [] }),
}));
vi.mock("../../../src/api/rpc/feelings", () => ({
  feelingsSaves: { addFeeling: { key: "addFeeling" }, changeFeeling: { key: "changeFeeling" } },
  useFeelingsQuery: () => ({ data: [] }),
}));
vi.mock("../../../src/api/rpc/appetite", () => ({
  appetiteSaves: { addAppetite: { key: "addAppetite" }, editAppetite: { key: "editAppetite" } },
  useAppetiteQuery: () => ({ data: appetite }),
}));
vi.mock("../../../src/api/rpc/photos", () => ({ photosSaves: { addPhoto: { key: "addPhoto" } }, usePhotosQuery: () => ({ data: [] }) }));
vi.mock("../../../src/api/rpc/papers", () => ({ papersSaves: { addPaper: { key: "addPaper" } }, usePapersQuery: () => ({ data: [] }) }));
vi.mock("../../../src/api/rpc/questions", () => ({ questionsSaves: { addQuestion: { key: "addQuestion" } }, useQuestionsQuery: () => ({ data: [] }) }));
vi.mock("../../../src/api/rpc/checklist", () => ({ checklistSaves: { addOwnTask: { key: "addOwnTask" } } }));
vi.mock("../../../src/api/rpc/people", () => ({ usePeopleQuery: () => ({ data: { me, people: [SAM] } }) }));
vi.mock("../../../src/api/rpc/quiet", () => ({ useQuietQuery: () => ({ data: quiet }) }));
vi.mock("../../../src/api/rpc/settings", () => ({
  settingsSaves: { saveSettings: { key: "saveSettings" } },
  useNow: () => now,
  useSettingsQuery: () => ({ data: { dueDate: null, baby: "unknown" } }),
}));
vi.mock("../../../src/app/hooks/useSave", () => ({
  useSave: (save: { key: string }) => (input: { id: string }) => {
    saved.push({ key: save.key, input });
    if (save.key === "addAppetite") appetite = [...appetite, { ...input, by: null, createdAt: "2026-10-30T00:00:00.000Z", editedBy: null, editedAt: null }];
  },
}));
vi.mock("../../../src/app/components/layout/CallBirthSuite", () => ({ CallBirthSuite: () => <a href="tel:0390000000">Call the birth suite</a> }));
vi.mock("../../../src/features/library/components/ItemLink", () => ({ ItemLink: ({ children }: { children: ReactNode }) => children }));
vi.mock("@sixthshift/design-system/overlay", () => ({ toast: (t: { title: string }) => toasts.push(t) }));
// Where the sheet was opened: kept from the Journal itself, the toast has no way there.
let pathname = "/";
const navigated: unknown[] = [];
vi.mock("../../../src/api/rpc/firsts", () => ({ firstsSaves: { markFirst: { key: "markFirst" } }, useFirstsQuery: () => ({ data: [] }) }));
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => (to: unknown) => navigated.push(to),
  useLocation: () => ({ pathname }),
  Link: ({ children }: { children: ReactNode }) => <a href="/emergency">{children}</a>,
}));

const { CaptureSheet } = await import("../../../src/features/capture/components/CaptureSheet");

beforeEach(() => {
  me = SAM;
  quiet = null;
  now = 28;
  saved.length = 0;
  appetite = [];
  toasts.length = 0;
  pathname = "/";
  navigated.length = 0;
});

const offered = () =>
  within(screen.getByRole("dialog"))
    .getAllByRole("listitem")
    .map((li) => li.querySelector("[data-choice]")?.textContent);

describe("CaptureSheet", () => {
  it("offers all ten, in their fixed order", () => {
    render(<CaptureSheet onClose={() => undefined} />);
    expect(offered()).toEqual([
      "The baby moved",
      "Sick or queasy",
      "A craving",
      "A note",
      "A photo or scan",
      "A result or paper",
      "How I'm feeling",
      "A first",
      "A question to ask",
      "Something to do",
    ]);
  });

  it("offers no feeling to a phone that hasn't said who's holding it, and no movement before week 16", () => {
    me = null;
    now = 12;
    render(<CaptureSheet onClose={() => undefined} />);
    expect(offered()).toEqual([
      "Sick or queasy",
      "A craving",
      "A note",
      "A photo or scan",
      "A result or paper",
      "A first",
      "A question to ask",
      "Something to do",
    ]);
  });

  it("while something has happened, never a movement, sickness, a craving or a photo, and nothing to do; a paper still", () => {
    quiet = { kind: "loss", setBy: null, setAt: "2026-10-30T00:00:00.000Z" };
    render(<CaptureSheet onClose={() => undefined} />);
    expect(offered()).toEqual(["A note", "A result or paper", "How I'm feeling", "A question to ask"]);
  });

  it("keeps a movement in one tap, closes, and says where it went", () => {
    const onClose = vi.fn();
    render(<CaptureSheet onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "The baby moved" }));
    fireEvent.click(screen.getByRole("button", { name: "Keep it" }));
    expect(saved).toEqual([{ key: "addMovement", input: expect.objectContaining({ body: "", different: false }) }]);
    expect(onClose).toHaveBeenCalled();
    expect(toasts.map((t) => t.title)).toEqual(["Movement kept"]);
  });

  it("a movement felt as slower, weaker or stopped is kept, and the call stays on screen until put away", () => {
    const onClose = vi.fn();
    render(<CaptureSheet onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "The baby moved" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Slower, weaker or stopped?" }));
    fireEvent.click(screen.getByRole("button", { name: "Keep it" }));
    expect(saved).toEqual([{ key: "addMovement", input: expect.objectContaining({ different: true }) }]);
    const alert = screen.getByRole("alert");
    expect(within(alert).getByText("Call your midwife or birth unit now.")).toBeTruthy();
    expect(within(alert).getByRole("link", { name: "Call the birth suite" })).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("keeps sickness in one tap, then closes on Done and says where it went", () => {
    const onClose = vi.fn();
    render(<CaptureSheet onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Sick or queasy" }));
    fireEvent.click(screen.getByRole("radio", { name: /Queasy/ }));
    expect(saved).toEqual([{ key: "addAppetite", input: expect.objectContaining({ kind: "sick", how: "queasy", what: null }) }]);
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(onClose).toHaveBeenCalled();
    expect(toasts.map((t) => t.title)).toEqual(["Sickness kept"]);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("can't keep fluids down is kept, and the call stays on screen", () => {
    const onClose = vi.fn();
    render(<CaptureSheet onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Sick or queasy" }));
    fireEvent.click(screen.getByRole("radio", { name: /Can't keep fluids down/ }));
    expect(saved).toEqual([{ key: "addAppetite", input: expect.objectContaining({ how: "fluids" }) }]);
    const alert = screen.getByRole("alert");
    expect(within(alert).getByText("Call your doctor, midwife or hospital now.")).toBeTruthy();
    expect(within(alert).getByRole("link", { name: "Call the birth suite" })).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("keeps a craving and closes; one for something that isn't food stays open on a quiet word", () => {
    const onClose = vi.fn();
    render(<CaptureSheet onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "A craving" }));
    fireEvent.change(screen.getByRole("textbox", { name: "What are you craving?" }), { target: { value: "Pickles" } });
    fireEvent.click(screen.getByRole("button", { name: "Keep it" }));
    expect(saved).toEqual([{ key: "addAppetite", input: expect.objectContaining({ kind: "craving", what: "Pickles", how: null }) }]);
    expect(onClose).toHaveBeenCalledTimes(1);

    cleanup();
    render(<CaptureSheet onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "A craving" }));
    fireEvent.change(screen.getByRole("textbox", { name: "What are you craving?" }), { target: { value: "Ice" } });
    fireEvent.click(screen.getByRole("button", { name: "Keep it" }));
    expect(screen.getByText(/worth mentioning to your midwife or doctor/)).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("files a question in the Planner", () => {
    const onClose = vi.fn();
    render(<CaptureSheet onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "A question to ask" }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Is the glucose test fasting?" } });
    fireEvent.submit(screen.getByRole("textbox").closest("form")!);
    expect(saved).toEqual([{ key: "addQuestion", input: expect.objectContaining({ text: "Is the glucose test fasting?" }) }]);
    expect(toasts.map((t) => t.title)).toEqual(["Question added"]);
    expect(onClose).toHaveBeenCalled();
  });

  it("goes back from a form to what to add", () => {
    render(<CaptureSheet onClose={() => undefined} />);
    fireEvent.click(screen.getByRole("button", { name: "A note" }));
    fireEvent.click(screen.getByRole("button", { name: "Back to what to add" }));
    expect(offered()).toHaveLength(10);
  });

  it("a photo: the camera one tap away, the phone's own picker beside it", () => {
    render(<CaptureSheet onClose={() => undefined} />);
    fireEvent.click(screen.getByRole("button", { name: "A photo or scan" }));
    const camera = screen.getByLabelText("Take a photo") as HTMLInputElement;
    expect(camera.type).toBe("file");
    expect(camera.getAttribute("capture")).toBe("environment");
    const picker = screen.getByLabelText("Choose photos") as HTMLInputElement;
    expect(picker.multiple).toBe(true);
    expect(picker.hasAttribute("capture")).toBe(false);
  });

  it("a result or paper: photographed, a page at a time, or chosen, a PDF or photos", () => {
    render(<CaptureSheet onClose={() => undefined} />);
    fireEvent.click(screen.getByRole("button", { name: "A result or paper" }));
    const camera = screen.getByLabelText("Photograph it") as HTMLInputElement;
    expect(camera.getAttribute("capture")).toBe("environment");
    const picker = screen.getByLabelText("Choose a file") as HTMLInputElement;
    expect(picker.multiple).toBe(true);
    expect(picker.accept).toBe("image/*,application/pdf");
  });

  it("kept from the Journal itself: said, with no way there, and the page stays", () => {
    pathname = "/journal";
    const onClose = vi.fn();
    render(<CaptureSheet initial="note" onClose={onClose} />);
    fireEvent.change(screen.getByRole("textbox", { name: "New note" }), { target: { value: "Hiccups" } });
    fireEvent.click(screen.getByRole("button", { name: "Keep it" }));
    const { input } = saved[0] as { input: { id: string; kind: string } };
    expect(input.kind).toBe("note");
    expect(onClose).toHaveBeenCalled();
    expect(toasts).toEqual([{ title: "Note kept", children: "In the Journal" }]);
    expect(navigated).toEqual([]);
  });

  it("a first: which, when, then its question", () => {
    render(<CaptureSheet initial="first" onClose={() => undefined} />);
    expect(screen.queryByRole("button", { name: "Found out boy or girl" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Felt the first kick" }));
    fireEvent.click(screen.getByRole("button", { name: "Mark it" }));
    expect(saved).toEqual([{ key: "markFirst", input: { key: "first-kick", day: expect.any(String) } }]);
  });

  it("from a task: a letter starts as a letter, and keeping it says so", () => {
    const kept = vi.fn();
    render(<CaptureSheet initial="note" letter onKept={kept} onClose={() => undefined} />);
    expect(screen.getByRole("checkbox", { name: "A letter to the baby" }).getAttribute("aria-checked")).toBe("true");
    fireEvent.change(screen.getByRole("textbox", { name: "New note" }), { target: { value: "Dear you" } });
    fireEvent.click(screen.getByRole("button", { name: "Keep it" }));
    expect(saved).toEqual([{ key: "addNote", input: expect.objectContaining({ kind: "letter", body: "Dear you" }) }]);
    expect(kept).toHaveBeenCalledOnce();
  });

  it("from a task: a first starts at that one; boy or girl, not yet known, asks whether to use it", () => {
    render(<CaptureSheet initial="first" first="boy-or-girl" onClose={() => undefined} />);
    fireEvent.click(screen.getByRole("button", { name: "Mark it" }));
    expect(screen.getByText(/Should Expecting use it/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Girl" }));
    expect(saved).toEqual([
      { key: "markFirst", input: { key: "boy-or-girl", day: expect.any(String) } },
      { key: "saveSettings", input: { baby: "girl" } },
    ]);
  });

  it("from a task: boy or girl can stay out of the app", () => {
    render(<CaptureSheet initial="first" first="boy-or-girl" onClose={() => undefined} />);
    fireEvent.click(screen.getByRole("button", { name: "Mark it" }));
    fireEvent.click(screen.getByRole("button", { name: "Keep it out of the app" }));
    expect(saved.map((s) => s.key)).toEqual(["markFirst"]);
  });
});
