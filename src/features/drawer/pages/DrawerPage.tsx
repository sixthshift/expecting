import { Link } from "@tanstack/react-router";
import { Baby, Camera, ChevronRight, Luggage, Timer } from "lucide-react";
import { useExtras } from "../../../api/rpc/extras";
import { useNames } from "../../../api/rpc/names";
import { usePeople } from "../../../api/rpc/people";
import { useQuiet } from "../../../api/rpc/quiet";
import { PillarHeader } from "../../../app/components/layout/PillarLayout";
import { Coming } from "../../../components/Coming";
import { extrasOn } from "../../../lib/extras";
import { extra } from "../../settings/model/extras";

/**
 * The handy things, each for its moment: the names (with the Choosing a name extra), the bump photos, the bag, the contractions.
 * While something has happened, the names and what's coming are put away, not deleted.
 */
export function DrawerPage() {
  const { data: names } = useNames();
  const { me, people } = usePeople().data;
  const { data: extras } = useExtras({ select: extrasOn });
  const other = people.find((p) => p.id !== me?.id) ?? null;
  const naming = extra("choosing-names");
  const { data: quiet } = useQuiet();

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 md:px-8">
      <PillarHeader title="Drawer" lead="The handy things, kept where you can find them when their moment comes." />
      {quiet ? (
        <p className="max-w-prose text-sm text-fg-subtle">The names and everything else here are put away while Expecting is quiet. Nothing is deleted.</p>
      ) : extras.has("choosing-names") ? (
        <Link
          to="/drawer/names"
          className="flex max-w-3xl items-center gap-4 rounded-xl border border-border-subtle bg-linear-to-br from-(--expecting-accent-soft-from) to-(--expecting-accent-soft-to) p-5 hover:border-border-brand"
        >
          <Baby aria-hidden size={28} className="shrink-0 text-fg-brand" />
          <span className="flex flex-1 flex-col gap-1">
            <span className="font-display text-xl font-semibold text-fg-strong">Baby names</span>
            <span className="text-sm text-fg-normal">
              {names.shortlist.length > 0
                ? `On the shortlist: ${names.shortlist.length === 1 ? names.shortlist[0]!.name : `${names.shortlist.length} names`}. Keep swiping.`
                : `Swipe through names on your own phone. A name goes on the shortlist when ${other ? `you and ${other.name}` : "you both"} like it.`}
            </span>
          </span>
          <ChevronRight aria-hidden size={20} className="shrink-0 text-fg-subtle" />
        </Link>
      ) : (
        <div className="flex max-w-3xl items-start gap-3 rounded-xl border border-border-subtle bg-bg-normal p-4">
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
      {quiet ? null : (
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
      )}
    </main>
  );
}
