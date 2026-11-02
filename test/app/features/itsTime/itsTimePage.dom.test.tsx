import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ItsTimePage } from "../../../../src/app/features/itsTime/contexts/ItsTimePageContext";
import type { Answer } from "../../../../src/lib/facts";

// It's time's context: the start under way, whether it's a home birth, and who's who.
const SAM = { id: "sam", name: "Sam", role: "carrying" as const };
const ALEX = { id: "alex", name: "Alex", role: "partner" as const };
let starts: { id: string; endedAt: string | null }[] = [];
let answers: Answer[] = [];
let people: { me: typeof SAM | typeof ALEX | null; people: (typeof SAM | typeof ALEX)[] } = { me: null, people: [] };
const selecting =
  <T,>(data: () => T) =>
  (options?: { select?: (d: T) => unknown }) => ({ data: options?.select ? options.select(data()) : data() });
vi.mock("../../../../src/api/rpc/itsTime", () => ({ useItsTimeQuery: selecting(() => ({ starts })) }));
vi.mock("../../../../src/api/rpc/facts", () => ({ useAnswersQuery: selecting(() => answers) }));
vi.mock("../../../../src/api/rpc/people", () => ({ usePeopleQuery: selecting(() => people) }));

const { ItsTimePageProvider, useItsTimePage } = await import("../../../../src/app/features/itsTime/contexts/ItsTimePageContext");

let seen: ItsTimePage;
function Probe() {
  seen = useItsTimePage();
  return null;
}
const page = () =>
  render(
    <ItsTimePageProvider>
      <Probe />
    </ItsTimePageProvider>
  );
const birthPlace = (value: string): Answer => ({ question: "birthPlace", about: null, value, answeredBy: null, answeredAt: "2026-10-01T00:00:00.000Z" });

beforeEach(() => {
  starts = [];
  answers = [];
  people = { me: null, people: [] };
});
afterEach(cleanup);

describe("ItsTimePageProvider", () => {
  it("no start, not at home, and no one yet: the practice run", () => {
    page();
    expect(seen).toEqual({ start: null, home: false, me: null, partner: null, carrying: null });
  });

  it("the start under way is the one not yet ended", () => {
    starts = [
      { id: "now", endedAt: null },
      { id: "false-alarm", endedAt: "2026-10-30T00:00:00.000Z" },
    ];
    page();
    expect(seen.start?.id).toBe("now");
  });

  it("a home birth, said as the birth place", () => {
    answers = [birthPlace("hospital"), birthPlace("home")];
    page();
    expect(seen.home).toBe(true);
  });

  it("who's holding the phone, and each of you by role", () => {
    people = { me: ALEX, people: [SAM, ALEX] };
    page();
    expect(seen).toMatchObject({ me: ALEX, partner: ALEX, carrying: SAM });
  });
});
