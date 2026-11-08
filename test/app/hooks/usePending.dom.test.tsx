import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePending } from "../../../src/app/hooks/usePending";

// A call that isn't a save (logging in, making an invite): its button spins
// while it goes, and a failure is said, not swallowed.
const toast = vi.fn();
const loggedOut = vi.fn();
vi.mock("@sixthshift/design-system/overlay", () => ({ toast: (t: unknown) => toast(t) }));
vi.mock("../../../src/app/model/loggedOut", () => ({ loggedOut: () => loggedOut() }));

function Button({ call }: { call: () => Promise<void> }) {
  const [pending, run] = usePending();
  return (
    <button type="button" onClick={() => run(call)}>
      {pending ? "Going" : "Go"}
    </button>
  );
}

beforeEach(() => {
  toast.mockClear();
  loggedOut.mockClear();
});
afterEach(cleanup);

describe("usePending", () => {
  it("is pending while the call goes, and not after", async () => {
    let finish = () => {};
    const call = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    render(<Button call={call} />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("button").textContent).toBe("Going");
    // A second tap while it goes is not a second call.
    fireEvent.click(screen.getByRole("button"));
    expect(call).toHaveBeenCalledTimes(1);
    await act(async () => finish());
    expect(screen.getByRole("button").textContent).toBe("Go");
    expect(toast).not.toHaveBeenCalled();
  });

  it("says so when the call fails, and lets you try again", async () => {
    render(<Button call={() => Promise.reject(new TypeError("Failed to fetch"))} />);
    await act(async () => fireEvent.click(screen.getByRole("button")));
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ intent: "danger", title: "That didn't go through" }));
    expect(screen.getByRole("button").textContent).toBe("Go");
  });
});
