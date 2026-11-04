import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLayout } from "../../../src/app/hooks/useLayout";
import { DESKTOP_MEDIA, layoutNow } from "../../../src/app/model/layout";

// Two experiences, one line between them (Tailwind's `lg`): a phone's under
// it, the desktop's on and over it, followed as the window crosses it.
let wide = false;
const listeners = new Set<() => void>();

beforeEach(() => {
  wide = false;
  listeners.clear();
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      get matches() {
        return query === DESKTOP_MEDIA && wide;
      },
      media: query,
      addEventListener: (_: string, fn: () => void) => listeners.add(fn),
      removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
    }))
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function resize(to: "mobile" | "desktop") {
  wide = to === "desktop";
  act(() => {
    for (const fn of listeners) fn();
  });
}

function Shows() {
  return <p>{useLayout()}</p>;
}

describe("useLayout", () => {
  it("is the phone's under the line, the desktop's on it", () => {
    expect(layoutNow()).toBe("mobile");
    wide = true;
    expect(layoutNow()).toBe("desktop");
  });

  it("follows the window across the line, both ways", () => {
    render(<Shows />);
    expect(screen.getByText("mobile")).toBeTruthy();
    resize("desktop");
    expect(screen.getByText("desktop")).toBeTruthy();
    resize("mobile");
    expect(screen.getByText("mobile")).toBeTruthy();
  });

  it("stops listening once nothing draws it", () => {
    const { unmount } = render(<Shows />);
    expect(listeners.size).toBe(1);
    unmount();
    expect(listeners.size).toBe(0);
  });
});
