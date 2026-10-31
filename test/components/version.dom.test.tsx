import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// The running version and its releases, fixed here so what Settings offers is what's tested.
vi.mock("../../src/lib/version", () => ({ VERSION: "0.4.0", COMMIT: "abc1234" }));
vi.mock("../../src/content/releases", async (actual) => ({
  ...(await actual<typeof import("../../src/content/releases")>()),
  releases: [
    { version: "0.3.0", notes: "## New\n\n- The names game" },
    { version: "0.4.0", notes: "## Fixed\n\n- The swipe" },
    { version: "0.5.0", notes: "## New\n\n- Not out yet" },
  ],
}));

const { Version } = await import("../../src/features/settings/components/version/Version");

describe("Version", () => {
  it("shows the version, and opens every release up to it on asking", () => {
    render(<Version />);
    expect(screen.getByText("Expecting 0.4.0 · abc1234")).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "What's changed" }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("The names game")).toBeTruthy();
    expect(screen.getByText("The swipe")).toBeTruthy();
    expect(screen.queryByText("Not out yet")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Got it" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
