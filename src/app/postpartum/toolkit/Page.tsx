import { Droplets, Milk, Moon } from "lucide-react";
import { Coming } from "../../../components/Coming";
import { PillarHeader } from "../../../features/app/PillarLayout";

/** The newborn's tools, for a night with a newborn: one hand, half awake. */
export function PostpartumToolkit() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 md:px-8">
      <PillarHeader title="Toolkit" lead="For a night with a newborn: one hand, half awake." />
      <Coming
        things={[
          { icon: Milk, title: "Feeds", about: "When, which side or how much, and when the last one was. Big buttons, one hand." },
          { icon: Droplets, title: "Nappies", about: "Wet and dirty, counted by the day: the number the midwife asks for." },
          { icon: Moon, title: "Sleep", about: "When they went down and woke, so a pattern shows. Never a target." },
        ]}
      />
    </main>
  );
}
