import { Baby, Camera, Luggage, Timer } from "lucide-react";
import { Coming } from "../../components/Coming";
import { PillarHeader } from "../app/PillarLayout";

/** The handy things, each for its moment: the names, the bump photos, the bag, the contractions. */
export function DrawerPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 md:px-8">
      <PillarHeader title="Drawer" lead="The handy things, kept where you can find them when their moment comes." />
      <Coming
        things={[
          {
            icon: Baby,
            title: "Baby names",
            about: "Swipe through names on your own phones; a name is a match only when you both like it. Then a shortlist.",
          },
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
