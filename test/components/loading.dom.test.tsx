import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoadingPage } from "../../src/components/loading/Loading";

describe("LoadingPage", () => {
  it("is announced as loading, and draws an animation", () => {
    render(<LoadingPage />);
    const status = screen.getByRole("status", { name: "Loading" });
    expect(status.querySelector("svg")).not.toBeNull();
  });
});
