import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LOADERS, Loading } from "../../src/components/loading/Loading";

describe("Loading", () => {
  it("is announced as loading, and draws an animation", () => {
    render(<Loading />);
    const status = screen.getByRole("status", { name: "Loading" });
    expect(status.querySelector("svg")).not.toBeNull();
  });

  it("picks one of the loaders once, not again on every render", () => {
    const random = vi.spyOn(Math, "random").mockReturnValue(0.99);
    const { rerender } = render(<Loading />);
    rerender(<Loading />);
    expect(random).toHaveBeenCalledTimes(1);
    expect(LOADERS.length).toBeGreaterThan(0);
    random.mockRestore();
  });
});
