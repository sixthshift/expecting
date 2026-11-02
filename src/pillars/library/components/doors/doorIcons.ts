import { BookA, CalendarCheck, CircleHelp, HandCoins, HeartHandshake, HeartPulse, type LucideIcon, Route, Signpost, Sparkles } from "lucide-react";
import type { Door } from "../../../../lib/library/doors";

/** Each door's icon, on its tile and on the quiet door's line. */
export const DOOR_ICONS: Record<Door, LucideIcon> = {
  "can-i": CircleHelp,
  normal: HeartPulse,
  surprises: Sparkles,
  glossary: BookA,
  moments: CalendarCheck,
  decisions: Signpost,
  money: HandCoins,
  guides: Route,
  hard: HeartHandshake,
};
