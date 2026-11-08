import { cn } from "@sixthshift/design-system/utils";
import { Link } from "@tanstack/react-router";
import { ChevronRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { Tool } from "../../model/tools";

/**
 * A tool that's on, in the Drawer: its icon, its name and a line of where
 * it's up to (`children`, the tool's own summary), opening its page.
 * `featured` gives it the accent, for the one that leads.
 */
export function ToolTile({
  to,
  icon: Icon,
  title,
  featured = false,
  children,
}: {
  to: Tool["to"];
  icon: LucideIcon;
  title: string;
  featured?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "flex max-w-3xl items-center gap-4 rounded-xl desktop:h-full desktop:max-w-none border border-border-subtle p-5 hover:border-border-brand",
        featured ? "bg-linear-to-br from-(--expecting-accent-soft-from) to-(--expecting-accent-soft-to)" : "bg-bg-normal"
      )}
    >
      <Icon aria-hidden size={28} className="shrink-0 text-fg-brand" />
      <span className="flex flex-1 flex-col gap-1">
        <span className="font-display text-xl font-semibold text-fg-strong">{title}</span>
        <span className="text-sm text-fg-normal">{children}</span>
      </span>
      <ChevronRight aria-hidden size={20} className="shrink-0 text-fg-subtle" />
    </Link>
  );
}
