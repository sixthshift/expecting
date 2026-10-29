import { Badge, type BadgeIntent } from "@sixthshift/design-system/badge";
import { Ban, CircleCheck, Gauge, type LucideIcon, MessageCircleQuestion } from "lucide-react";
import type { Verdict as VerdictValue } from "../../../content/schema";

/** A can-i's answer, as words, a colour and a mark. */
export const VERDICT: Record<VerdictValue, { label: string; intent: BadgeIntent; Icon: LucideIcon }> = {
  yes: { label: "Yes", intent: "success", Icon: CircleCheck },
  limit: { label: "With limits", intent: "warning", Icon: Gauge },
  avoid: { label: "Avoid", intent: "danger", Icon: Ban },
  ask: { label: "Ask first", intent: "neutral", Icon: MessageCircleQuestion },
};

/** The answer to "Can I…?", first thing under the question. */
export function Verdict({ verdict, size = "md" }: { verdict: VerdictValue; size?: "sm" | "md" }) {
  const { label, intent, Icon } = VERDICT[verdict];
  return (
    <Badge size={size} variant="soft" intent={intent} className="gap-1.5 self-start">
      <Icon aria-hidden size={size === "md" ? 16 : 12} />
      {label}
    </Badge>
  );
}
