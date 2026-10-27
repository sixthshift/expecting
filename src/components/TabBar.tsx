import { Link } from "@tanstack/react-router";
import { CalendarRange, ListChecks, MessageCircleQuestion, Settings, Sprout } from "lucide-react";

const tabs = [
  { to: "/", label: "This week", icon: Sprout, exact: true },
  { to: "/weeks", label: "Weeks", icon: CalendarRange, exact: false },
  { to: "/checklist", label: "Checklist", icon: ListChecks, exact: false },
  { to: "/questions", label: "Questions", icon: MessageCircleQuestion, exact: false },
  { to: "/settings", label: "Settings", icon: Settings, exact: false },
] as const;

/**
 * The main navigation, one element shaped for the screen: on a phone a bottom
 * tab bar within thumb reach and clear of the home indicator; from `lg` a rail
 * down the left, where a pointer expects it and the width is to spare.
 */
export function TabBar() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-border-subtle bg-bg-normal pb-[env(safe-area-inset-bottom)] lg:inset-y-0 lg:right-auto lg:w-56 lg:border-t-0 lg:border-r lg:px-3 lg:pt-8 lg:pb-6"
    >
      <p className="mb-6 hidden items-center gap-2 px-3 text-lg font-semibold text-fg-strong lg:flex">
        <Sprout aria-hidden size={22} className="text-fg-brand" />
        Expecting
      </p>
      <ul className="flex lg:flex-col lg:gap-1">
        {tabs.map(({ to, label, icon: Icon, exact }) => (
          <li key={to} className="flex-1 lg:flex-none">
            <Link
              to={to}
              activeOptions={{ exact }}
              className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs text-fg-subtle lg:min-h-11 lg:flex-row lg:justify-start lg:gap-3 lg:rounded-md lg:px-3 lg:text-sm lg:hover:bg-bg-subtle-hovered"
              activeProps={{ className: "text-fg-brand font-medium lg:bg-bg-brand-subtle", "aria-current": "page" }}
            >
              <Icon aria-hidden size={22} className="lg:size-5" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
