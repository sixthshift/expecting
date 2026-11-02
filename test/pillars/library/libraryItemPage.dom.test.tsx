import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Item } from "../../../src/content/schema";
import type { Answer } from "../../../src/lib/facts";
import type { LibraryItemPage } from "../../../src/pillars/library/contexts/LibraryItemPageContext";

// An entry's page, from the id in its address: the entry as your Library has
// it, or why it isn't there (an answer, an extra that's off, or none by it).
const HOSPITAL = { id: "hospital-tour", title: "The hospital tour", when: { birthPlace: ["hospital"] }, extra: null } as unknown as Item;
const BABYMOON = { id: "flying-pregnant", title: "Flying while pregnant", when: {}, extra: "babymoon" } as unknown as Item;
const SHOWN = { id: "morphology-scan", title: "The morphology scan", when: {}, extra: null } as unknown as Item;
let answers: Answer[] = [];
let choices: { id: string; on: boolean }[] = [];
const words = Promise.resolve({ body: "" });
vi.mock("../../../src/content", () => ({ builtInItems: [HOSPITAL, BABYMOON, SHOWN] }));
vi.mock("../../../src/pillars/library/hooks/useItems", () => ({ useItems: () => [SHOWN] }));
vi.mock("../../../src/pillars/library/model/pageOf", () => ({ pageOf: () => words }));
vi.mock("../../../src/api/rpc/facts", () => ({ useAnswersQuery: ({ select }: { select: (a: Answer[]) => unknown }) => ({ data: select(answers) }) }));
vi.mock("../../../src/api/rpc/extras", () => ({ useExtrasQuery: ({ select }: { select: (c: typeof choices) => unknown }) => ({ data: select(choices) }) }));

const { LibraryItemPageProvider, useLibraryItemPage } = await import("../../../src/pillars/library/contexts/LibraryItemPageContext");

let seen: LibraryItemPage;
function Probe() {
  seen = useLibraryItemPage();
  return null;
}
const page = (itemId: string) =>
  render(
    <LibraryItemPageProvider itemId={itemId}>
      <Probe />
    </LibraryItemPageProvider>
  );

beforeEach(() => {
  answers = [];
  choices = [];
});
afterEach(cleanup);

describe("LibraryItemPageProvider", () => {
  it("an entry your Library has: it, and its words on the way", () => {
    page("morphology-scan");
    expect(seen).toMatchObject({ itemId: "morphology-scan", item: SHOWN, hidden: undefined, hiddenBy: undefined, offExtra: undefined });
    expect(seen.page).toBe(words);
  });

  it("hidden by an answer: which question, to open settings at", () => {
    answers = [{ question: "birthPlace", about: null, value: "home", answeredBy: null, answeredAt: "2026-10-01T00:00:00.000Z" }];
    page("hospital-tour");
    expect(seen).toMatchObject({ item: undefined, hidden: HOSPITAL, hiddenBy: "birthPlace", offExtra: undefined, page: undefined });
  });

  it("part of an extra that's off: which extra", () => {
    page("flying-pregnant");
    expect(seen.hidden).toBe(BABYMOON);
    expect(seen.offExtra?.name).toBe("Babymoon");
    expect(seen.hiddenBy).toBeUndefined();
  });

  it("no entry by that id: nothing hidden, nothing to say why", () => {
    page("no-such-entry");
    expect(seen).toMatchObject({ itemId: "no-such-entry", item: undefined, hidden: undefined, hiddenBy: undefined, offExtra: undefined, page: undefined });
  });
});
