/// <reference types="@testing-library/jest-dom" />
// The DOM project's setup (vite.config.ts). The node project has no DOM shims:
// one there would hide the very absence it exists to prove.
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

// Not in happy-dom, and the design system's primitives measure with it.
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

afterEach(() => {
  cleanup();
});
