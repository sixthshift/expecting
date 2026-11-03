import { useQuietPlannerPage } from "../contexts/QuietPlannerPageContext";
import { InMotion } from "./InMotion";

/**
 * The Planner's To do while Expecting is quiet: nothing to do, the list put
 * aside rather than deleted, and what you'd already set in motion, for when
 * you're ready: claims that may still matter, and bookings you might cancel.
 */
export function PutAside() {
  const { kind, inMotion } = useQuietPlannerPage();
  const { claims, bookings } = inMotion;
  return (
    <section aria-labelledby="todo" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 id="todo" className="text-lg font-display font-semibold text-fg-strong">
          To do
        </h2>
        <p className="max-w-prose text-fg-normal">Nothing needs doing. The to-do list is put aside, not deleted.</p>
      </div>
      {claims.length > 0 ? (
        <InMotion
          id="claims"
          title="Claims you've started"
          lead="Some may still apply, and some may need stopping."
          tasks={claims}
          more={kind === "loss" ? { id: "leave-after-loss", label: "Leave and pay after a loss" } : undefined}
        />
      ) : null}
      {bookings.length > 0 ? (
        <InMotion
          id="bookings"
          title="Already booked or done"
          lead="You might want to cancel some of these, when you're ready. There's no hurry."
          tasks={bookings}
        />
      ) : null}
    </section>
  );
}
