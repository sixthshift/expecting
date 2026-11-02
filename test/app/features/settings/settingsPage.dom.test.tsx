import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SettingsPage } from "../../../../src/app/features/settings/contexts/SettingsPageContext";
import { asksFor } from "../../../../src/lib/facts";

// Settings' context: the one row open (`?ask=` opens at it), the extra a link
// marks, and how many questions are answered and which is next.
const where = vi.hoisted(() => ({ ask: undefined as string | undefined, dueDate: null as string | null }));
vi.mock("@tanstack/react-router", () => ({ getRouteApi: () => ({ useSearch: () => ({ ask: where.ask }) }) }));
vi.mock("../../../../src/api/rpc/settings", () => ({
  useSettingsQuery: ({ select }: { select: (s: { dueDate: string | null }) => unknown }) => ({ data: select({ dueDate: where.dueDate }) }),
}));
vi.mock("../../../../src/api/rpc/facts", () => ({ useAnswersQuery: () => ({ data: [] }) }));

const { SettingsPageProvider, useSettingsPage, DUE_DATE } = await import("../../../../src/app/features/settings/contexts/SettingsPageContext");

let seen: SettingsPage;
function Probe() {
  seen = useSettingsPage();
  return null;
}
const page = () =>
  render(
    <SettingsPageProvider>
      <Probe />
    </SettingsPageProvider>
  );
const ASKS = asksFor({});

beforeEach(() => {
  where.ask = undefined;
  where.dueDate = null;
  vi.stubGlobal("requestAnimationFrame", (f: () => void) => {
    f();
    return 0;
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("SettingsPageProvider", () => {
  it("nothing open; without a due date, it's next, and counted among those to answer", () => {
    page();
    expect(seen.open).toBeNull();
    expect(seen.next).toBe(DUE_DATE);
    expect(seen.total).toBe(ASKS.length + 1);
    expect(seen.answered).toBe(0);
    expect(seen.waiting("pregnancy")).toBe(ASKS.filter((a) => a.question.group === "pregnancy").length + 1);
  });

  it("with a due date, the first question is next, and the due date is answered", () => {
    where.dueDate = "2027-01-20";
    page();
    expect(ASKS.length).toBeGreaterThan(0);
    expect(seen.next).toBe(ASKS[0]?.key);
    expect(seen.answered).toBe(1);
  });

  it("one row open at a time: toggling the open one closes it", () => {
    page();
    act(() => seen.toggle("cover"));
    expect(seen.open).toBe("cover");
    act(() => seen.toggle(DUE_DATE));
    expect(seen.open).toBe(DUE_DATE);
    act(() => seen.toggle(DUE_DATE));
    expect(seen.open).toBeNull();
    act(() => seen.toggle("cover"));
    act(() => seen.close());
    expect(seen.open).toBeNull();
  });

  it("goTo opens a row and scrolls to it", () => {
    const row = document.createElement("div");
    row.id = "setting-cover";
    row.scrollIntoView = vi.fn();
    document.body.append(row);
    page();
    act(() => seen.goTo("cover"));
    expect(seen.open).toBe("cover");
    expect(row.scrollIntoView).toHaveBeenCalled();
    row.remove();
  });

  it("?ask= opens at that row, and an extra's is marked", () => {
    where.ask = "extra:babymoon";
    page();
    expect(seen.open).toBe("extra:babymoon");
    expect(seen.highlight).toBe("babymoon");
    cleanup();
    where.ask = "cover";
    page();
    expect(seen.open).toBe("cover");
    expect(seen.highlight).toBeUndefined();
  });
});
