import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Item } from "../../../src/content/schema";
import { ContentContext } from "../../../src/features/library/components/content/context";

// "Ask at my next appointment" on an entry, with the outbox stood in for: a
// suggestion taken into the box and changed, your own words, one already on
// the list, and nothing at all on a private entry. What's added names its entry.
const saved: { key: string; input: unknown }[] = [];

vi.mock("../../../src/api/rpc/questions", () => ({ questionsSaves: { addQuestion: { key: "addQuestion" } } }));
vi.mock("../../../src/app/hooks/useSave", () => ({ useSave: (save: { key: string }) => (input: unknown) => saved.push({ key: save.key, input }) }));
vi.mock("@sixthshift/design-system/overlay", () => ({ toast: () => undefined }));

const { AskAtAppointment } = await import("../../../src/features/library/components/askAtAppointment/AskAtAppointment");

function item(rest: Partial<Item> = {}): Item {
  return {
    id: "antidepressants",
    title: "Antidepressants",
    summary: null,
    from: null,
    to: null,
    type: "guide",
    topic: "medicines",
    ask: null,
    aliases: [],
    who: null,
    stakes: null,
    verdict: null,
    decideBy: null,
    surprise: false,
    private: false,
    discreet: false,
    draft: true,
    when: {},
    extra: null,
    variables: [],
    tasks: [],
    origin: "built-in",
    ...rest,
  } as Item;
}

function draw(entry: Item, openQuestions: string[] = [], appointment: string[] = []) {
  render(
    <ContentContext.Provider value={{ facts: {}, now: null, openQuestions }}>
      <AskAtAppointment item={entry} page={{ appointment }} />
    </ContentContext.Provider>
  );
}

beforeEach(() => {
  saved.length = 0;
});
afterEach(cleanup);

describe("AskAtAppointment", () => {
  it("sends your own words, naming the entry", () => {
    draw(item());
    fireEvent.click(screen.getByRole("button", { name: "Ask at my next appointment" }));
    expect(screen.queryByText("Suggested")).toBeNull();
    fireEvent.change(screen.getByRole("textbox", { name: "Your question" }), { target: { value: "Should I keep my dose the same?" } });
    fireEvent.click(screen.getByRole("button", { name: "Add to my questions" }));
    expect(saved).toEqual([{ key: "addQuestion", input: expect.objectContaining({ text: "Should I keep my dose the same?", itemId: "antidepressants" }) }]);
  });

  it("on an ask-first can-i, offers its own question, to change before it's added", () => {
    draw(item({ type: "can-i", verdict: "ask", ask: "Can I keep taking my antidepressants?" }));
    fireEvent.click(screen.getByRole("button", { name: "Ask at my next appointment" }));
    fireEvent.click(screen.getByRole("button", { name: "Can I keep taking my antidepressants?" }));
    const box = screen.getByRole("textbox", { name: "Your question" }) as HTMLTextAreaElement;
    expect(box.value).toBe("Can I keep taking my antidepressants?");
    fireEvent.change(box, { target: { value: "Can I keep taking sertraline?" } });
    fireEvent.click(screen.getByRole("button", { name: "Add to my questions" }));
    expect(saved[0]!.input).toMatchObject({ text: "Can I keep taking sertraline?", itemId: "antidepressants" });
  });

  it("offers the questions its page suggests, after its own, each once", () => {
    const own = "Can I keep taking my antidepressants?";
    draw(item({ type: "can-i", verdict: "ask", ask: own }), [], [own, "Should my dose change as I go?"]);
    fireEvent.click(screen.getByRole("button", { name: "Ask at my next appointment" }));
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual([own, "Should my dose change as I go?"]);
  });

  it("says when a suggestion is already on your list, and won't add it twice", () => {
    const q = "Can I keep taking my antidepressants?";
    draw(item({ type: "can-i", verdict: "ask", ask: q }), [q]);
    fireEvent.click(screen.getByRole("button", { name: "Ask at my next appointment" }));
    expect(screen.getByText("On your list")).toBeTruthy();
    fireEvent.change(screen.getByRole("textbox", { name: "Your question" }), { target: { value: q } });
    expect((screen.getByRole("button", { name: "Add to my questions" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("offers nothing on a private entry", () => {
    draw(item({ private: true }));
    expect(screen.queryByRole("button", { name: "Ask at my next appointment" })).toBeNull();
  });
});
