import type { LucideIcon } from "lucide-react";

/** Something a pillar will hold, not built yet: said plainly rather than faked. */
export function Coming({ things }: { things: { icon: LucideIcon; title: string; about: string }[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {things.map(({ icon: Icon, title, about }) => (
        <li key={title} className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-bg-normal p-4">
          <span className="flex items-center gap-2">
            <Icon aria-hidden size={18} className="text-fg-brand" />
            <span className="font-medium text-fg-strong">{title}</span>
            <span className="ml-auto rounded-full border border-border-subtle px-2 text-xs text-fg-subtle">Coming</span>
          </span>
          <span className="text-sm text-fg-subtle">{about}</span>
        </li>
      ))}
    </ul>
  );
}
