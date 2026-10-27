import { cn } from "@sixthshift/design-system/utils";
import { Link } from "@tanstack/react-router";
import { Page, Section } from "../../components/Page";
import { builtInItems, startsAt } from "../../content";
import { todayISO } from "../../lib/dates";
import { allSlots, type Phase, positionOn, type Slot, sameSlot, slotKey, slotLabel, slotShortLabel } from "../../lib/timeline";
import { Route } from "./route";

const groups: { title: string; test: (s: Slot) => boolean }[] = [
  { title: "Before", test: (s) => s.phase === "before" },
  { title: "First trimester", test: (s) => s.phase === "pregnancy" && s.week <= 13 },
  { title: "Second trimester", test: (s) => s.phase === "pregnancy" && s.week >= 14 && s.week <= 27 },
  { title: "Third trimester", test: (s) => s.phase === "pregnancy" && s.week >= 28 },
  { title: "After the birth", test: (s) => s.phase === ("postpartum" satisfies Phase) },
];

/** Every week at once. All of it is always readable; the due date only marks where you are. */
export function WeeksPage() {
  const { dueDate, birthDate } = Route.useLoaderData();
  const current = dueDate ? positionOn(todayISO(), dueDate, birthDate).slot : null;
  const slots = allSlots();

  return (
    <Page title="Weeks" subtitle="Read ahead, or look back. A dot means something new starts that week.">
      {/* One group per row on a phone; from lg, two trimesters side by side, "Before" across both. */}
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-x-10 lg:gap-y-8">
        {groups.map((group, i) => (
          <Section key={group.title} title={group.title} className={i === 0 ? "lg:col-span-2" : undefined}>
            <ul className="grid grid-cols-6 gap-2 sm:grid-cols-7">
              {slots.filter(group.test).map((slot) => {
                const isNow = current !== null && sameSlot(current, slot);
                const count = builtInItems.filter((item) => startsAt(item, slot)).length;
                return (
                  <li key={slotKey(slot)} className={slot.phase === "before" ? "col-span-full sm:col-span-3 lg:col-span-2" : undefined}>
                    <Link
                      to="/week/$slot"
                      params={{ slot: slotKey(slot) }}
                      aria-label={`${slotLabel(slot)}${isNow ? ", this week" : ""}${count > 0 ? `, ${count} new` : ""}`}
                      aria-current={isNow ? "date" : undefined}
                      className={cn(
                        "flex min-h-11 flex-col items-center justify-center rounded-md border text-sm",
                        isNow ? "border-border-brand bg-bg-brand text-fg-on-brand font-semibold" : "border-border-subtle bg-bg-normal"
                      )}
                    >
                      {slot.phase === "before" ? "Before you start" : slotShortLabel(slot)}
                      <span
                        aria-hidden
                        className={cn("mt-0.5 size-1.5 rounded-full", count > 0 ? (isNow ? "bg-fg-on-brand" : "bg-fg-brand") : "bg-transparent")}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Section>
        ))}
      </div>
    </Page>
  );
}
