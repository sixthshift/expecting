import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StoryItem } from "../../../../src/lib/journal/story/items";
import type { QuietJournalPage } from "../../../../src/pillars/journal/quiet/contexts/QuietJournalPageContext";
import { appetite, entry, paper, photo, story } from "../../../lib/journal/storyFixtures";

// The quiet Journal's context: what has happened (the quiet query's), and the story split once into what stays and what's folded away.
let items: StoryItem[] = [];
vi.mock("../../../../src/pillars/journal/hooks/useStoryItems", () => ({ useStoryItems: () => items }));
let kind: "loss" | "news" = "loss";
vi.mock("../../../../src/app/features/quiet/hooks/useQuietKind", () => ({ useQuietKind: () => kind }));

const { QuietJournalPageProvider, useQuietJournalPage } = await import("../../../../src/pillars/journal/quiet/contexts/QuietJournalPageContext");

let seen: QuietJournalPage;
function Probe() {
  seen = useQuietJournalPage();
  return null;
}
const page = (k: "loss" | "news" = "loss") => {
  kind = k;
  return render(
    <QuietJournalPageProvider>
      <Probe />
    </QuietJournalPageProvider>
  );
};

beforeEach(() => {
  items = [];
});
afterEach(cleanup);

describe("QuietJournalPageProvider", () => {
  it("nothing kept: nothing shown, nothing folded", () => {
    page("news");
    expect(seen).toEqual({ kind: "news", shown: [], folded: [] });
  });

  it("the notes and papers stay; the photos and cravings are folded away, each newest first", () => {
    items = story({
      journal: [entry("note", "2026-10-27")],
      appetite: [appetite("craving", "2026-10-29")],
      photos: [photo("bump", "2026-10-28")],
      papers: [paper("2026-10-21")],
    });
    page();
    expect(seen.kind).toBe("loss");
    expect(seen.shown.map((i) => i.kind)).toEqual(["note", "paper"]);
    expect(seen.folded.map((i) => i.kind)).toEqual(["appetite", "photo"]);
  });

  it("outside its provider, a mistake said plainly", () => {
    const quietly = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<Probe />)).toThrow("useQuietJournalPage must be called inside QuietJournalPageProvider");
    quietly.mockRestore();
  });
});
