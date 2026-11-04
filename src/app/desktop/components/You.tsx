import { Button } from "@sixthshift/design-system/button";
import { Popover } from "@sixthshift/design-system/popover";
import { Link } from "@tanstack/react-router";
import { Suspense, useState } from "react";
import { usePeopleQuery } from "../../../api/rpc/people";
import { logout, useAccessQuery } from "../../../api/rpc/session";
import { forgetData } from "../../../pwa/register";

/**
 * Whose session this is, last in the top bar: your initial, opening your name,
 * settings, and logging out on this computer, asked first. A computer is more
 * often shared than a phone, so handing it to the other of you is one click
 * away. Logging out everywhere stays in Settings.
 */
export function You() {
  const { data: me } = usePeopleQuery({ select: (people) => people.me });
  const [leaving, setLeaving] = useState(false);
  if (!me) return null;
  return (
    <Popover placement="bottom-end" onOpenChange={(open) => !open && setLeaving(false)}>
      <Popover.Trigger
        aria-label={`You're ${me.name}`}
        className="ml-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-bg-brand-subtle text-sm font-semibold text-fg-on-brand-subtle hover:bg-bg-brand-subtle-hovered"
      >
        {me.name.slice(0, 1).toUpperCase()}
      </Popover.Trigger>
      <Popover.Body aria-label="You" className="flex w-72 flex-col gap-3 p-4">
        <p className="text-sm text-fg-subtle">
          Logged in as <span className="font-semibold text-fg-strong">{me.name}</span>
        </p>
        {leaving ? (
          <Suspense fallback={null}>
            <Leave onCancel={() => setLeaving(false)} />
          </Suspense>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Popover.Close asChild>
              <Link
                to="/settings"
                className="flex min-h-9 items-center rounded-md border border-border-normal px-3 text-sm text-fg-normal hover:bg-bg-subtle-hovered"
              >
                Settings
              </Link>
            </Popover.Close>
            <Button variant="outline" onClick={() => setLeaving(true)}>
              Log out
            </Button>
          </div>
        )}
      </Popover.Body>
    </Popover>
  );
}

/** Logging out here, once it's been asked: with logins on coming back takes your password; off, it's handing the computer over. */
function Leave({ onCancel }: { onCancel: () => void }) {
  const { data: login } = useAccessQuery({ select: (access) => access.login });
  async function leave() {
    await logout();
    // Nor in what the service worker keeps for offline.
    await forgetData();
    // A full load, not a navigation: nothing of yours stays in this tab's memory.
    window.location.assign("/login");
  }
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-fg-normal">
        {login
          ? "Log out on this computer? Coming back takes your password. Nothing is lost."
          : "Log out on this computer, to hand it to the other of you? Nothing is lost."}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button intent="danger" onClick={leave}>
          Yes, log out
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
