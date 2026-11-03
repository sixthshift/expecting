import { Glob } from "bun";
import { describe, expect, it } from "vitest";

// Two experiences, a phone's and a desktop's, chosen by `useLayout()` and
// followed by the `phone:` and `desktop:` variants: nothing goes back to
// Tailwind's `lg` breakpoint, which would draw a third idea of where the line is.
const BREAKPOINT = /(?<![\w-])(max-)?lg:/;

describe("the layouts", () => {
  it("nothing in src/ uses the lg breakpoint: desktop: and phone: instead, or useLayout()", async () => {
    const found: string[] = [];
    for await (const path of new Glob("src/**/*.{ts,tsx,css}").scan(".")) {
      const lines = (await Bun.file(path).text()).split("\n");
      lines.forEach((line, i) => {
        if (BREAKPOINT.test(line)) found.push(`${path}:${i + 1}`);
      });
    }
    expect(found).toEqual([]);
  });
});
