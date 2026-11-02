import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Photo } from "../../../src/lib/photos";

// Photos and scans in the Journal, with the query cache, the outbox and the
// phone's upload store stood in for: a photo is made ready, said what it is,
// kept on the phone and then saved; the bump row ends in this week's empty
// frame; deleting asks first; and while something has happened it's all
// folded away, never a bump after a loss.
const SAM = { id: "sam", name: "Sam", role: "carrying" as const };
const DUE = "2027-01-19";
let photos: Photo[] = [];
let quiet: "loss" | "news" | null = null;
const saved: { key: string; input: unknown }[] = [];
const kept: string[] = [];
let prepare: (file: File) => Promise<unknown>;

const shot = (id: string, day: string, kind: Photo["kind"], caption: string | null = null): Photo => ({
  id,
  fileId: `file-${id}`,
  kind,
  day,
  time: "09:00",
  caption,
  by: SAM.id,
  createdAt: `${day}T00:00:00.000Z`,
  editedBy: null,
  editedAt: null,
});

vi.mock("../../../src/api/rpc/photos", () => ({
  photosSaves: { addPhoto: { key: "addPhoto" }, editPhoto: { key: "editPhoto" }, deletePhoto: { key: "deletePhoto" } },
  usePhotosQuery: () => ({ data: photos }),
}));
vi.mock("../../../src/api/rpc/settings", () => ({ useNow: () => 28, useSettingsQuery: () => ({ data: { dueDate: DUE } }) }));
vi.mock("../../../src/api/rpc/people", () => ({ usePeopleQuery: () => ({ data: { me: SAM, people: [SAM] } }) }));
vi.mock("../../../src/app/hooks/useSave", () => ({ useSave: (save: { key: string }) => (input: unknown) => saved.push({ key: save.key, input }) }));
vi.mock("../../../src/app/hooks/useUploadSrc", () => ({ useUploadSrc: (id: string, variant: string) => `/api/files/${id}/${variant}` }));
vi.mock("../../../src/pwa/register", () => ({ forgetFile: async () => undefined }));
vi.mock("@sixthshift/design-system/overlay", () => ({ toast: () => undefined }));
vi.mock("../../../src/app/model/uploads", () => {
  class FileProblemError extends Error {
    constructor(readonly problem: string) {
      super(problem);
    }
  }
  return {
    FileProblemError,
    prepareFile: (file: File) => prepare(file),
    previewUrl: () => null,
    keepOnPhone: async (id: string) => {
      kept.push(id);
    },
    isOnPhone: () => false,
  };
});

const { AddPhoto } = await import("../../../src/features/journal/components/entries/photos/AddPhoto");
const { PhotosLens } = await import("../../../src/features/journal/components/story/lenses/photos/PhotosLens");
const { FileProblemError } = await import("../../../src/app/model/uploads");

const prepared = (takenAt: { day: string; time: string } | null) => ({
  name: "IMG_2041.jpg",
  type: "image/jpeg",
  size: 2_000_000,
  width: 3024,
  height: 4032,
  parts: { original: new Blob(["x"]), display: new Blob(["d"]), thumb: new Blob(["t"]) },
  takenAt,
});

function choose(name = "IMG_2041.jpg") {
  fireEvent.change(screen.getByLabelText("Choose photos"), { target: { files: [new File(["x"], name, { type: "image/jpeg" })] } });
}

beforeEach(() => {
  photos = [];
  quiet = null;
  saved.length = 0;
  kept.length = 0;
  prepare = async () => prepared({ day: "2026-10-20", time: "09:40" });
});

describe("AddPhoto", () => {
  it("is ready, says when its camera took it, waits to be told what it is, and is kept on the phone before it's saved", async () => {
    const onAdded = vi.fn();
    render(<AddPhoto onAdded={onAdded} />);
    choose();
    expect(await screen.findByText("What is it?")).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Taken Tue,? 20 Oct( 2026)?, 9:40 am · Week 27 · Change$/ })).toBeTruthy();
    const keep = screen.getByRole("button", { name: "Keep it" });
    expect(keep).toBeDisabled();
    fireEvent.click(screen.getByRole("radio", { name: "Scan" }));
    fireEvent.change(screen.getByRole("textbox", { name: "A few words, if you want" }), { target: { value: " 20-week scan " } });
    fireEvent.click(keep);
    await vi.waitFor(() => expect(onAdded).toHaveBeenCalled());
    expect(kept).toHaveLength(1);
    expect(saved).toEqual([
      { key: "addPhoto", input: expect.objectContaining({ fileId: kept[0], kind: "scan", day: "2026-10-20", time: "09:40", caption: "20-week scan" }) },
    ]);
  });

  it("from the bump row's frame it's a bump already; without a camera date it's now", async () => {
    prepare = async () => prepared(null);
    render(<AddPhoto kind="bump" />);
    choose();
    expect(await screen.findByRole("button", { name: "Keep it" })).not.toBeDisabled();
    expect(screen.queryByText("What is it?")).toBeNull();
    expect(screen.getByRole("button", { name: /^Today, .* · Change$/ })).toBeTruthy();
  });

  it("says plainly what it can't keep", async () => {
    prepare = async () => {
      throw new FileProblemError("heic");
    };
    render(<AddPhoto />);
    choose("IMG_2041.HEIC");
    expect((await screen.findByRole("alert")).textContent).toMatch(/can't open that photo \(HEIC\)/);
    expect(saved).toEqual([]);
  });

  it("after a loss, never a bump", async () => {
    render(<AddPhoto kinds={["scan", "other"]} />);
    choose();
    await screen.findByText("What is it?");
    expect(screen.queryByRole("radio", { name: "Bump" })).toBeNull();
    expect(screen.getByRole("radio", { name: "Scan" })).toBeTruthy();
  });
});

describe("PhotosLens", () => {
  it("the bump week by week, ending in this week's empty frame, side by side and the scrubber from two weeks", () => {
    photos = [shot("a", "2026-07-08", "bump"), shot("b", "2026-09-02", "bump"), shot("c", "2026-09-03", "scan", "Morphology scan")];
    render(<PhotosLens quiet={null} />);
    const row = screen.getByRole("region", { name: "Your bump, week by week" });
    expect(
      within(row)
        .getAllByRole("listitem")
        .map((li) => li.textContent)
    ).toEqual(["Week 12", "Week 20", "Week 28"]);
    expect(within(row).getByRole("button", { name: "Take week 28's bump photo" })).toBeTruthy();
    expect(within(row).getByRole("button", { name: /Side by side/ })).toBeTruthy();
    expect(screen.getByRole("slider", { name: "Week" })).toBeTruthy();
    // Every photo under its week, newest first.
    expect(screen.getByRole("region", { name: "Week 20" })).toBeTruthy();
    expect(screen.getByRole("img", { name: /^Scan, week 20, .*Morphology scan$/ })).toBeTruthy();
  });

  it("one bump week isn't a series yet: no empty frame asking for this week's, no scrubber", () => {
    photos = [shot("a", "2026-07-08", "bump")];
    render(<PhotosLens quiet={null} />);
    expect(screen.queryByRole("button", { name: /^Take week/ })).toBeNull();
    expect(screen.queryByRole("slider")).toBeNull();
    expect(screen.queryByRole("button", { name: /Side by side/ })).toBeNull();
  });

  it("no bump photos, no bump row at all", () => {
    photos = [shot("c", "2026-09-03", "scan")];
    render(<PhotosLens quiet={null} />);
    expect(screen.queryByRole("region", { name: "Your bump, week by week" })).toBeNull();
  });

  it("deleting asks first, and then goes from both phones", () => {
    photos = [shot("a", "2026-10-28", "other", "The first outfit")];
    render(<PhotosLens quiet={null} />);
    fireEvent.click(screen.getByRole("img", { name: /The first outfit/ }).closest("button")!);
    const viewer = screen.getByRole("dialog");
    fireEvent.click(within(viewer).getByRole("button", { name: "Delete" }));
    expect(within(viewer).getByRole("alert").textContent).toMatch(/goes from both phones, and can't be put back/);
    expect(saved).toEqual([]);
    fireEvent.click(within(viewer).getByRole("button", { name: "Delete it" }));
    expect(saved).toEqual([{ key: "deletePhoto", input: { id: "a" } }]);
  });

  it("while something has happened, plain, with a way to add one but never a bump after a loss", async () => {
    quiet = "loss";
    photos = [shot("a", "2026-07-08", "bump"), shot("b", "2026-09-02", "scan")];
    render(<PhotosLens quiet={quiet} />);
    expect(screen.getByRole("region", { name: "Photos and scans" })).toBeTruthy();
    expect(screen.queryByRole("slider")).toBeNull();
    expect(screen.queryByRole("region", { name: "Your bump, week by week" })).toBeNull();
    expect(screen.queryByRole("button", { name: /Side by side/ })).toBeNull();
    expect(screen.getByRole("region", { name: "Week 12" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Add a photo" }));
    choose();
    await screen.findByText("What is it?");
    expect(screen.queryByRole("radio", { name: "Bump" })).toBeNull();
  });
});
