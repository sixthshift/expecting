import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// The running version and its releases, fixed here so the dialog's rule is what's tested.
vi.mock("../../src/lib/version", () => ({ VERSION: "0.4.0", COMMIT: "" }));
vi.mock("../../src/content/releases", async (actual) => ({
  ...(await actual<typeof import("../../src/content/releases")>()),
  releases: [
    { version: "0.3.0", notes: "## New\n\n- The names game" },
    { version: "0.4.0", notes: "## Fixed\n\n- The swipe" },
  ],
}));

const { WhatsNew } = await import("../../src/app/components/WhatsNew");
const { SEEN_VERSION_KEY } = await import("../../src/app/model/seenVersion");

afterEach(() => localStorage.clear());

describe("WhatsNew", () => {
  it("shows nothing on a phone that has never kept a version, and keeps the running one", () => {
    render(<WhatsNew />);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(localStorage.getItem(SEEN_VERSION_KEY)).toBe("0.4.0");
  });

  it("shows every release since the one seen, and Got it marks the running one seen", () => {
    localStorage.setItem(SEEN_VERSION_KEY, "0.2.0");
    render(<WhatsNew />);
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("The names game")).toBeTruthy();
    expect(screen.getByText("The swipe")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Got it" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(localStorage.getItem(SEEN_VERSION_KEY)).toBe("0.4.0");
  });

  it("shows nothing once the running version is seen", () => {
    localStorage.setItem(SEEN_VERSION_KEY, "0.4.0");
    render(<WhatsNew />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
