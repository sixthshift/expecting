import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Baby, Camera, ChevronRight, Luggage, Siren, Timer } from "lucide-react";
import { useMemo } from "react";
import { Coming } from "../../components/Coming";
import { todayISO } from "../../lib/dates";
import { PillarHeader } from "../app/PillarLayout";
import { householdQuery, namesQuery } from "../household/load";
import { workOut } from "../household/workOut";
import { NamesGame } from "../names/NamesGame";
import { extra } from "../settings/model/extras";

/** The handy things, each for its moment: Emergency info, the names (with the Choosing a name extra), the bump photos, the bag, the contractions. */
export function DrawerPage() {
  const { data: names } = useSuspenseQuery(namesQuery);
  const { data: state } = useSuspenseQuery(householdQuery);
  const today = todayISO();
  const { extras } = useMemo(() => workOut(state, today), [state, today]);
  const other = state.people.find((p) => p.id !== state.me?.id) ?? null;
  const naming = extra("choosing-names");

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-16 md:px-8">
      <PillarHeader title="Drawer" lead="The handy things, kept where you can find them when their moment comes." />
      <Link
        to="/drawer/emergency"
        className="flex items-center gap-4 rounded-xl border border-border-subtle bg-bg-normal p-4 hover:bg-bg-normal-hovered sm:p-6"
      >
        <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-full bg-bg-brand-subtle text-fg-brand">
          <Siren size={20} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="font-display text-xl font-semibold text-fg-strong">Emergency info</span>
          <span className="text-sm text-fg-subtle">Who to call, what a doctor will ask, and the numbers you'll need, on one page.</span>
        </span>
        <ChevronRight aria-hidden size={18} className="shrink-0 text-fg-subtle" />
      </Link>
      {extras.has("choosing-names") ? (
        <NamesGame view={names} other={other} />
      ) : (
        <div className="flex items-start gap-3 rounded-xl border border-border-subtle bg-bg-normal p-4">
          <Baby aria-hidden size={18} className="mt-0.5 shrink-0 text-fg-brand" />
          <p className="text-sm text-fg-normal">
            <span className="font-medium text-fg-strong">Baby names:</span> swipe through names on your own phones; a name is a match only when you both like
            it. It comes with {naming.name}.{" "}
            <Link to="/settings" search={{ ask: `extra:${naming.id}` }} className="underline">
              Turn it on in settings
            </Link>
          </p>
        </div>
      )}
      <Coming
        things={[
          {
            icon: Camera,
            title: "Bump booth",
            about: "A bump photo each week, with last week's showing faintly so you match the pose. At the birth, it plays back as a time-lapse.",
          },
          { icon: Timer, title: "Contraction timer", about: "How long, how far apart, and when it's time to call." },
          { icon: Luggage, title: "Hospital bag", about: "What to pack, ticked off together." },
        ]}
      />
    </main>
  );
}
