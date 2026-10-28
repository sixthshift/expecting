import { Camera, FileText, Footprints, IceCreamCone, NotebookPen, Smile } from "lucide-react";
import { Coming } from "../../components/Coming";
import { PillarHeader } from "../app/PillarLayout";

/** The pregnancy, kept: each entry on its day here, and on its week in the timeline. */
export function JournalPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 md:px-8">
      <PillarHeader
        title="Journal"
        lead="What happens, kept. Each entry on its day here and on its week in the timeline, so by the birth the timeline is the story of the pregnancy."
      />
      <Coming
        things={[
          { icon: Footprints, title: "Movements", about: "When you feel the baby move, so you know their usual pattern. Any change is a call, never a chart." },
          { icon: IceCreamCone, title: "Cravings and sickness", about: "What and when. Useful when the midwife asks “since when?”, and fun later." },
          { icon: Smile, title: "How you're feeling", about: "A quick mood, with words if you want them. Gentle, never a score." },
          { icon: NotebookPen, title: "Notes", about: "Anything worth remembering, from either of you." },
          { icon: Camera, title: "Photos and scans", about: "Bump photos and scan images, backed up." },
          { icon: FileText, title: "Results and papers", about: "Blood tests, screening, letters, the birth plan, the discharge summary." },
        ]}
      />
    </main>
  );
}
