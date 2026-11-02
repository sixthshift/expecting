import { Button } from "@sixthshift/design-system/button";
import { Checkbox } from "@sixthshift/design-system/checkbox";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useChecklistQuery } from "../../../../api/rpc/checklist";
import { useEmergencyQuery } from "../../../../api/rpc/emergency";
import { useAnswersQuery } from "../../../../api/rpc/facts";
import { itsTimeSaves, useItsTimeQuery } from "../../../../api/rpc/itsTime";
import { useListsQuery } from "../../../../api/rpc/lists";
import { useSave } from "../../../../app/hooks/useSave";
import { factsOf } from "../../../../lib/facts";
import { clock } from "../../../../lib/itsTime";
import { useLines } from "../../../planner/hooks/useLines";
import { useItsTimePage } from "../../contexts/ItsTimePageContext";
import { bagOf, CAR_SEAT_TASK } from "../../model/ready";
import { CallButton } from "../CallButton";
import { Part } from "../Part";
import { AddOwn } from "./AddOwn";
import { OwnLine } from "./OwnLine";

/** The page's own last things, by key: ticked for this start only. */
const RING = "ring-on-the-way";
const PAPERS = "papers";

/**
 * Before you go: a short list of last things, ticked for this start alone, not
 * a second packing list. Ring to say you're coming; the bag's last things (the
 * ones that only go in on the night); the car seat, from its task; the papers;
 * who's minding the kids or pets; and your own lines, kept between starts.
 * Then "We're leaving", which keeps the time. For a home birth it's before the
 * midwife arrives, with no trip to make.
 */
export function BeforeYouGo() {
  // Before a start, shown greyed, nothing to tick.
  const { start, home } = useItsTimePage();
  const { values } = useEmergencyQuery().data;
  const { data: firstBaby } = useAnswersQuery({ select: (a) => factsOf(a).firstBaby });
  const { data: carSeatFitted } = useChecklistQuery({ select: (c) => Boolean(c.ticks[CAR_SEAT_TASK]) });
  const { data: ownLines } = useItsTimeQuery({ select: (t) => t.lines });
  const { marks } = useListsQuery().data;
  const lines = useLines();
  const bag = bagOf(lines, marks);
  const showMinder = firstBaby === "no" || Boolean(values.minder);
  const tick = useSave(itsTimeSaves.tickStart);
  const leave = useSave(itsTimeSaves.leaveStart);
  const ticked = new Set(start?.ticks ?? []);
  const box = (key: string, label: React.ReactNode) => (
    <li key={key} className="flex min-h-11 items-center">
      <Checkbox
        label={label}
        checked={ticked.has(key)}
        disabled={!start}
        onCheckedChange={(on) => start && tick({ startId: start.id, key, ticked: on === true })}
      />
    </li>
  );

  return (
    <Part id="before-you-go" title={home ? "Before the midwife arrives" : "Before you go"}>
      <ul className="flex flex-col gap-1 rounded-xl border border-border-subtle bg-bg-normal px-4 py-2">
        {home ? null : box(RING, "Ring to say you're on your way")}
        {home ? null : (
          <li className="flex flex-col gap-1 py-2">
            <Link
              to="/planner/lists/$listId"
              params={{ listId: "bag" }}
              className="flex min-h-11 w-fit items-center gap-1 font-medium text-fg-strong underline-offset-2 hover:underline"
            >
              The bag
              <ChevronRight aria-hidden size={16} />
            </Link>
            <span className="text-sm text-fg-subtle">
              {bag.total === 0 ? "Nothing on it yet." : bag.packed >= bag.total ? "Packed." : `${bag.packed} of ${bag.total} packed: take what's ready.`} Then
              the last things:
            </span>
            <ul className="flex flex-col pl-2">{bag.lastThings.map((l) => box(l.id, l.title))}</ul>
          </li>
        )}
        {home ? null : (
          <li className="flex min-h-11 items-center text-fg-normal">
            {carSeatFitted ? "The car seat is fitted." : "The car seat isn't fitted yet: it's needed to drive home."}
          </li>
        )}
        {home ? null : box(PAPERS, "Papers: Medicare card, health fund card, the birth plan (the handy ones are on this phone too)")}
        {showMinder ? (
          <li className="flex flex-col gap-2 py-2">
            {box("minder", values.minder ? `${values.minder} is minding the kids or pets` : "Someone to mind the kids or pets")}
            {values.minderPhone ? <CallButton phone={values.minderPhone}>Call {values.minder ?? "them"}</CallButton> : null}
          </li>
        ) : null}
        {ownLines.map((l) => (
          <OwnLine
            key={l.id}
            line={l}
            checked={ticked.has(l.id)}
            disabled={!start}
            onTick={(on) => start && tick({ startId: start.id, key: l.id, ticked: on })}
          />
        ))}
        <li>
          <AddOwn />
        </li>
      </ul>
      {start && !home ? (
        start.leftAt ? (
          <p className="text-fg-strong">You left at {clock(start.leftAt)}.</p>
        ) : (
          <Button size="lg" intent="brand" className="min-h-14" onClick={() => leave({ startId: start.id })}>
            We're leaving
          </Button>
        )
      ) : null}
    </Part>
  );
}
