import { TriangleAlert } from "lucide-react";

/** The danger colour, kept for a call your own tap has set off. */
export function Alarm({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="flex gap-2 rounded-xl border border-border-danger bg-bg-danger-subtle px-4 py-3 font-semibold text-fg-strong">
      <TriangleAlert aria-hidden size={20} className="mt-0.5 shrink-0 text-fg-danger" />
      <span>{children}</span>
    </p>
  );
}
