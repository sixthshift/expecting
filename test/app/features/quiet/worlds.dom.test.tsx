import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// A route's page in both worlds: the normal one, or the quiet one while something has happened.
let kind: "loss" | "news" | null = null;
vi.mock("../../../../src/app/features/quiet/hooks/useQuietKind", () => ({ useQuietKind: () => kind }));

const { worlds } = await import("../../../../src/app/features/quiet/worlds");

const Normal = Object.assign(() => <p>The week</p>, { preload: vi.fn(async () => undefined) });
const Quiet = Object.assign(() => <p>Take the time you need</p>, { preload: vi.fn(async () => undefined) });

beforeEach(() => {
  kind = null;
  vi.clearAllMocks();
});
afterEach(cleanup);

describe("worlds", () => {
  it("draws the normal page while nothing has happened", () => {
    const Page = worlds(Normal, Quiet);
    render(<Page />);
    expect(screen.getByText("The week")).toBeTruthy();
    expect(screen.queryByText("Take the time you need")).toBeNull();
  });

  it("draws the quiet page while something has happened, at the same place", () => {
    kind = "loss";
    const Page = worlds(Normal, Quiet);
    render(<Page />);
    expect(screen.getByText("Take the time you need")).toBeTruthy();
    expect(screen.queryByText("The week")).toBeNull();
  });

  it("swaps in place when it changes", () => {
    const Page = worlds(Normal, Quiet);
    const { rerender } = render(<Page />);
    kind = "news";
    rerender(<Page />);
    expect(screen.getByText("Take the time you need")).toBeTruthy();
  });

  it("fetches both worlds ahead, one without a preload too", async () => {
    await worlds(Normal, Quiet).preload?.();
    expect(Normal.preload).toHaveBeenCalledOnce();
    expect(Quiet.preload).toHaveBeenCalledOnce();
    await expect(worlds(Normal, () => null).preload?.()).resolves.toBeUndefined();
  });
});
