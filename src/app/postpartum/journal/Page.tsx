import { Camera, HeartHandshake, NotebookPen, Ruler, Sparkles, Star } from "lucide-react";
import { Coming } from "../../../components/Coming";
import { PillarHeader } from "../../../features/app/PillarLayout";

/** The baby's first weeks, kept. The pregnancy's entries are still there, in the story. */
export function PostpartumJournal() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 md:px-8">
      <PillarHeader title="Journal" lead="The first weeks, kept. They go by in a blur, and this is where they stay." />
      <Coming
        things={[
          { icon: Star, title: "The birth story", about: "How it went, in your words, while you still remember it. Both of you, if you like." },
          { icon: Sparkles, title: "Firsts", about: "The first bath, the first smile, the first night home." },
          { icon: Ruler, title: "Growth", about: "Weight, length and head, from the checks in the baby's health record book." },
          {
            icon: HeartHandshake,
            title: "How you're both going",
            about: "A quick check-in for each of you. Gentle, never a score, with support one tap away.",
          },
          { icon: NotebookPen, title: "Notes", about: "Anything worth remembering, from either of you." },
          { icon: Camera, title: "Photos", about: "The first weeks, backed up." },
        ]}
      />
    </main>
  );
}
