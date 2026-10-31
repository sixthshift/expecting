import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Line } from "../../../src/content/schema";
import type { Mark } from "../../../src/lib/lists";

// A line on a list, with the outbox stood in for: ticked got and back
// (keeping its words), and opened to say it's arranged, how it was got and a
// few words. One of your own can be renamed and deleted; a built-in one can't.
const saved: { key: string; input: unknown }[] = [];

vi.mock("../../../src/api/rpc/lists", () => ({
  listsSaves: { markLine: { key: "markLine" }, changeLine: { key: "changeLine" }, deleteLine: { key: "deleteLine" } },
}));
vi.mock("../../../src/app/hooks/useSave", () => ({ useSave: (save: { key: string }) => (input: unknown) => saved.push({ key: save.key, input }) }));
vi.mock("../../../src/features/library/components/ItemLink", () => ({
  ItemLink: ({ children }: { children: unknown }) => <a href="#entry">{children as string}</a>,
}));

const { LineRow } = await import("../../../src/features/lists/components/line/LineRow");

const builtIn: Line = {
  id: "get-car-seat",
  title: "Car seat",
  listId: "baby",
  section: "out-and-about",
  when: {},
  taskId: "buy-and-fit-car-seat",
  itemId: "car-seat",
  origin: "built-in",
};
const own: Line = { ...builtIn, id: "11111111-1111-4111-8111-111111111111", title: "Bouncer", section: null, taskId: null, itemId: null, origin: "own" };
const mark = (fields: Partial<Mark>): Mark => ({
  lineId: builtIn.id,
  state: null,
  how: null,
  note: null,
  by: null,
  updatedAt: "2026-11-01T00:00:00.000Z",
  ...fields,
});

beforeEach(() => {
  saved.length = 0;
});
afterEach(cleanup);

describe("LineRow", () => {
  it("says its task's when until it's got, and ticks it got keeping its words", () => {
    render(<LineRow line={builtIn} mark={mark({ note: "Rear-facing" })} by={null} task={{ label: "by week 36 · in To do" }} />);
    expect(screen.getByText("“Rear-facing” · by week 36 · in To do")).toBeTruthy();
    fireEvent.click(screen.getByRole("checkbox", { name: "Car seat" }));
    expect(saved).toEqual([{ key: "markLine", input: { lineId: "get-car-seat", state: "got", how: null, note: "Rear-facing" } }]);
  });

  it("says where it's up to and who set it, and unticks back to still to get", () => {
    render(<LineRow line={builtIn} mark={mark({ state: "got", how: "borrowed" })} by="Sam" task={null} />);
    expect(screen.getByText("borrowed · Sam")).toBeTruthy();
    fireEvent.click(screen.getByRole("checkbox", { name: "Car seat" }));
    expect(saved[0]!.input).toEqual({ lineId: "get-car-seat", state: null, how: null, note: null });
  });

  it("opened, is marked arranged with a few words, and links to its entry; a built-in line can't be deleted", () => {
    render(<LineRow line={builtIn} mark={undefined} by={null} task={null} />);
    fireEvent.click(screen.getByRole("button", { name: "Change: Car seat" }));
    expect(screen.getByText("Why, and what to look for")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Delete" })).toBeNull();
    fireEvent.click(screen.getByRole("radio", { name: "Arranged" }));
    fireEvent.change(screen.getByRole("textbox", { name: "A few words" }), { target: { value: " Mum's lending hers " } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(saved).toEqual([{ key: "markLine", input: { lineId: "get-car-seat", state: "arranged", how: null, note: "Mum's lending hers" } }]);
  });

  it("opened, says how it was got once it's got", () => {
    render(<LineRow line={builtIn} mark={undefined} by={null} task={null} />);
    fireEvent.click(screen.getByRole("button", { name: "Change: Car seat" }));
    expect(screen.queryByRole("radio", { name: "Second hand" })).toBeNull();
    fireEvent.click(screen.getByRole("radio", { name: "Got" }));
    fireEvent.click(screen.getByRole("radio", { name: "Second hand" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(saved[0]!.input).toEqual({ lineId: "get-car-seat", state: "got", how: "second-hand", note: null });
  });

  it("one of your own is renamed, or deleted", () => {
    render(<LineRow line={own} mark={undefined} by={null} task={null} />);
    fireEvent.click(screen.getByRole("button", { name: "Change: Bouncer" }));
    fireEvent.change(screen.getByRole("textbox", { name: "What it is" }), { target: { value: "Rocker" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(saved).toEqual([{ key: "changeLine", input: { id: own.id, title: "Rocker", section: null } }]);
    fireEvent.click(screen.getByRole("button", { name: "Change: Bouncer" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(saved[1]).toEqual({ key: "deleteLine", input: { id: own.id } });
  });
});
