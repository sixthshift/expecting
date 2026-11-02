import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Paper } from "../../../src/lib/papers";

// Results and papers in the Journal, with the query cache, the outbox and the
// phone's upload store stood in for: a paper's pages are made ready, said
// what they are, kept on the phone and then saved as one paper; handy ones
// come first and are on Emergency info; deleting asks first; and after a loss
// nothing pregnancy-forward is suggested.
const SAM = { id: "sam", name: "Sam", role: "carrying" as const };
const DUE = "2027-01-19";
let papers: Paper[] = [];
let quiet: { kind: "loss" | "news" } | null = null;
const saved: { key: string; input: unknown }[] = [];
const kept: string[] = [];
let prepare: (file: File) => Promise<unknown>;

const pdfPage = (fileId: string) => ({ fileId, type: "application/pdf" as const, name: `${fileId}.pdf`, size: 120_000 });

const paper = (id: string, fields: Partial<Paper> = {}): Paper => ({
  id,
  kind: "result",
  title: id,
  itemId: null,
  day: "2026-10-28",
  note: null,
  handy: false,
  pages: [pdfPage(`file-${id}`)],
  by: SAM.id,
  createdAt: "2026-10-30T00:00:00.000Z",
  editedBy: null,
  editedAt: null,
  ...fields,
});

vi.mock("../../../src/api/rpc/papers", () => ({
  papersSaves: { addPaper: { key: "addPaper" }, editPaper: { key: "editPaper" }, deletePaper: { key: "deletePaper" } },
  usePapersQuery: () => ({ data: papers }),
}));
vi.mock("../../../src/api/rpc/settings", () => ({ useNow: () => 28, useSettingsQuery: () => ({ data: { dueDate: DUE } }) }));
vi.mock("../../../src/api/rpc/people", () => ({ usePeopleQuery: () => ({ data: { me: SAM, people: [SAM] } }) }));
vi.mock("../../../src/api/rpc/quiet", () => ({ useQuietQuery: () => ({ data: quiet }) }));
vi.mock("../../../src/app/hooks/useSave", () => ({ useSave: (save: { key: string }) => (input: unknown) => saved.push({ key: save.key, input }) }));
vi.mock("../../../src/app/hooks/useUploadSrc", () => ({ useUploadSrc: (id: string, variant: string) => `/api/files/${id}/${variant}` }));
vi.mock("../../../src/pwa/register", () => ({ forgetFile: async () => undefined }));
vi.mock("@sixthshift/design-system/overlay", () => ({ toast: () => undefined }));
vi.mock("../../../src/features/library/components/ItemLink", () => ({
  ItemLink: ({ children }: { children: ReactNode }) => <a href="/library">{children}</a>,
}));
vi.mock("@tanstack/react-router", () => ({ Link: ({ children }: { children: ReactNode }) => <a href="/journal">{children}</a> }));
vi.mock("../../../src/content", () => ({
  builtInItems: [{ id: "glucose-tolerance-test", title: "The glucose tolerance test", from: 24, to: 28, private: false }],
  isPrivateItem: () => false,
}));
vi.mock("../../../src/app/model/uploads", () => {
  class FileProblemError extends Error {
    constructor(readonly problem: string) {
      super(problem);
    }
  }
  return {
    FileProblemError,
    prepareFile: (file: File) => prepare(file),
    previewUrl: () => "blob:preview",
    keepOnPhone: async (id: string) => {
      kept.push(id);
    },
    isOnPhone: () => false,
  };
});

const { AddPaper } = await import("../../../src/features/journal/components/entries/papers/AddPaper");
const { PapersRecord } = await import("../../../src/features/journal/components/records/papers/PapersRecord");
const { PapersToHand, PapersAbout } = await import("../../../src/features/journal/components/entries/papers/PaperList");
const { FileProblemError } = await import("../../../src/app/model/uploads");

const photographed = (name: string) => ({
  name,
  type: "image/jpeg",
  size: 2_000_000,
  width: 3024,
  height: 4032,
  parts: { original: new Blob(["x"]), display: new Blob(["d"]), thumb: new Blob(["t"]) },
  takenAt: null,
});
const asPdf = (name: string) => ({
  name,
  type: "application/pdf",
  size: 120_000,
  width: null,
  height: null,
  parts: { original: new Blob(["%PDF-"]) },
  takenAt: null,
});

function choose(...names: string[]) {
  fireEvent.change(screen.getAllByLabelText(/^(Choose a file|Add a file)$/)[0]!, {
    target: { files: names.map((name) => new File(["x"], name, { type: name.endsWith(".pdf") ? "application/pdf" : "image/jpeg" })) },
  });
}

beforeEach(() => {
  papers = [];
  quiet = null;
  saved.length = 0;
  kept.length = 0;
  prepare = async (file) => (file.name.endsWith(".pdf") ? asPdf(file.name) : photographed(file.name));
});

describe("AddPaper", () => {
  it("several photos are one paper's pages, kept on the phone each, then saved as one, once it's said what it is and named", async () => {
    const onAdded = vi.fn();
    render(<AddPaper onAdded={onAdded} />);
    choose("page1.jpg", "page2.jpg");
    const pages = await screen.findByRole("list", { name: "The 2 pages" });
    expect(
      within(pages)
        .getAllByRole("img")
        .map((img) => img.getAttribute("alt"))
    ).toEqual(["Page 1", "Page 2"]);
    const keep = screen.getByRole("button", { name: "Keep it" });
    expect(keep).toBeDisabled();
    fireEvent.click(screen.getByRole("radio", { name: "Letter or referral" }));
    expect(keep).toBeDisabled();
    fireEvent.change(screen.getByRole("textbox", { name: "Its name" }), { target: { value: " Referral to the Women's " } });
    fireEvent.change(screen.getByRole("textbox", { name: "Anything to remember, if you want" }), { target: { value: "The GP kept a copy" } });
    expect(screen.getByRole("button", { name: /^Dated today( · Week \d+)? · Change$/ })).toBeTruthy();
    fireEvent.click(keep);
    await vi.waitFor(() => expect(onAdded).toHaveBeenCalled());
    expect(kept).toHaveLength(2);
    expect(saved).toEqual([
      {
        key: "addPaper",
        input: expect.objectContaining({
          kind: "letter",
          title: "Referral to the Women's",
          itemId: null,
          note: "The GP kept a copy",
          handy: false,
          pages: [
            { fileId: kept[0], type: "image/jpeg", name: "page1.jpg", size: 2_000_000 },
            { fileId: kept[1], type: "image/jpeg", name: "page2.jpg", size: 2_000_000 },
          ],
        }),
      },
    ]);
  });

  it("a PDF is a tile; a plan is kept handy unless you say otherwise", async () => {
    render(<AddPaper />);
    choose("Birth plan.pdf");
    expect(await screen.findByRole("img", { name: "Page 1: Birth plan.pdf" })).toBeTruthy();
    fireEvent.click(screen.getByRole("radio", { name: "Plan" }));
    expect(screen.getByRole("switch", { name: "Keep handy" }).getAttribute("aria-checked")).toBe("true");
    fireEvent.click(screen.getByRole("switch", { name: "Keep handy" }));
    expect(screen.getByRole("switch", { name: "Keep handy" }).getAttribute("aria-checked")).toBe("false");
  });

  it("a page can be taken out before it's kept, and more added", async () => {
    render(<AddPaper />);
    choose("page1.jpg", "page2.jpg");
    await screen.findByRole("list", { name: "The 2 pages" });
    fireEvent.click(screen.getByRole("button", { name: "Take out page 1" }));
    expect(screen.getByRole("list", { name: "The page" })).toBeTruthy();
    choose("page3.jpg");
    expect(await screen.findByRole("list", { name: "The 2 pages" })).toBeTruthy();
  });

  it("a result offers what it's about; after a loss, nothing pregnancy-forward is suggested", async () => {
    const { unmount } = render(<AddPaper />);
    choose("gtt.pdf");
    await screen.findByRole("radio", { name: "Result" });
    fireEvent.click(screen.getByRole("radio", { name: "Result" }));
    expect(screen.getByText("What it's about")).toBeTruthy();
    unmount();

    quiet = { kind: "loss" };
    render(<AddPaper />);
    choose("discharge.pdf");
    await screen.findByRole("radio", { name: "Result" });
    fireEvent.click(screen.getByRole("radio", { name: "Result" }));
    expect(screen.queryByText("What it's about")).toBeNull();
    fireEvent.click(screen.getByRole("radio", { name: "Plan" }));
    expect(screen.getByRole("switch", { name: "Keep handy" }).getAttribute("aria-checked")).toBe("false");
  });

  it("says plainly what it can't keep", async () => {
    prepare = async () => {
      throw new FileProblemError("type");
    };
    render(<AddPaper />);
    choose("notes.docx");
    expect((await screen.findByRole("alert")).textContent).toMatch(/a PDF, or a photo/);
    expect(saved).toEqual([]);
  });
});

describe("PapersRecord", () => {
  it("handy first, then newest by the date on it, and the kinds there are to filter by", () => {
    papers = [
      paper("Old result", { day: "2026-08-01" }),
      paper("Referral", { kind: "letter", day: "2026-10-01" }),
      paper("Birth plan", { kind: "plan", day: "2026-07-01", handy: true }),
    ];
    render(<PapersRecord quiet={null} />);
    const list = screen.getByRole("list", { name: "Your papers" });
    expect(
      within(list)
        .getAllByRole("listitem")
        .map((li) => li.querySelector(".font-medium")?.textContent)
    ).toEqual(["Birth plan", "Referral", "Old result"]);
    fireEvent.click(screen.getByRole("radio", { name: "Letters" }));
    expect(within(screen.getByRole("list", { name: "Your papers" })).getAllByRole("listitem")).toHaveLength(1);
  });

  it("opened: its pages, what it's about; deleting asks first, and then every page goes from both phones", () => {
    papers = [paper("GTT", { itemId: "glucose-tolerance-test", note: "Copy to the GP" })];
    render(<PapersRecord quiet={null} />);
    fireEvent.click(screen.getByRole("button", { name: /^GTT/ }));
    const viewer = screen.getByRole("dialog");
    expect(within(viewer).getByRole("link", { name: "The glucose tolerance test" })).toBeTruthy();
    expect(within(viewer).getByRole("link", { name: /Open/ }).getAttribute("href")).toBe("/api/files/file-GTT/original");
    expect(within(viewer).getByText("Copy to the GP")).toBeTruthy();
    fireEvent.click(within(viewer).getByRole("button", { name: "Delete" }));
    expect(within(viewer).getByRole("alert").textContent).toMatch(/Every page goes from both phones, and can't be put back/);
    expect(saved).toEqual([]);
    fireEvent.click(within(viewer).getByRole("button", { name: "Delete it" }));
    expect(saved).toEqual([{ key: "deletePaper", input: { id: "GTT" } }]);
  });

  it("kept handy or not, in one tap from the paper", () => {
    papers = [paper("Blood group")];
    render(<PapersRecord quiet={null} />);
    fireEvent.click(screen.getByRole("button", { name: /^Blood group/ }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("switch", { name: "Keep handy" }));
    expect(saved).toEqual([{ key: "editPaper", input: expect.objectContaining({ id: "Blood group", handy: true }) }]);
  });
});

describe("where else they're wanted", () => {
  it("Emergency info has the handy ones; with none, how to put one there", () => {
    papers = [paper("Birth plan", { kind: "plan", handy: true }), paper("GTT")];
    const { unmount } = render(<PapersToHand />);
    expect(
      within(screen.getByRole("list", { name: "Papers kept handy" }))
        .getAllByRole("listitem")
        .map((li) => li.textContent)
    ).toEqual([expect.stringMatching(/Birth plan/)]);
    unmount();
    papers = [paper("GTT")];
    render(<PapersToHand />);
    expect(screen.getByRole("link", { name: "keep it handy in the Journal" })).toBeTruthy();
  });

  it("a Library entry has the papers about it, and nothing when there are none", () => {
    papers = [paper("GTT", { itemId: "glucose-tolerance-test" }), paper("Referral", { kind: "letter" })];
    const { unmount } = render(<PapersAbout itemId="glucose-tolerance-test" />);
    expect(within(screen.getByRole("list", { name: "Your papers about this" })).getAllByRole("listitem")).toHaveLength(1);
    unmount();
    const { container } = render(<PapersAbout itemId="nipt" />);
    expect(container.textContent).toBe("");
  });
});
