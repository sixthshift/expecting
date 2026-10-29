import { Button } from "@sixthshift/design-system/button";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { forgetPerson } from "../../../../api/rpc/people";
import { logout } from "../../../../api/rpc/session";
import type { Person } from "../../../../lib/people";
import { useAction } from "../../../app/hooks/useAction";

/** Who's holding this phone, the household it's shared with, and the way out. */
export function ThisPhone({ me, people }: { me: Person | null; people: readonly Person[] }) {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);
  const [forget, forgetting] = useAction(() => forgetPerson());

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border-subtle bg-bg-normal p-4">
      <p className="text-sm text-fg-normal">
        {me ? (
          <>
            This is <span className="font-semibold">{me.name}</span>'s phone.
          </>
        ) : (
          "This phone hasn't said whose it is."
        )}{" "}
        {people.length > 1 ? `Expecting is shared by ${people.map((p) => p.name).join(" and ")}.` : null}
      </p>
      {leaving ? (
        <div className="flex flex-col gap-3 rounded-lg bg-bg-subtle p-3">
          <p className="text-sm text-fg-normal">Log out on this phone? Coming back takes the household's password. Nothing is lost.</p>
          <div className="flex flex-wrap gap-2">
            <Button
              intent="danger"
              onClick={async () => {
                await logout();
                // A full load, not a navigation: nothing of the household stays in this tab's memory.
                window.location.assign("/login");
              }}
            >
              Yes, log out
            </Button>
            <Button variant="outline" onClick={() => setLeaving(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            loading={forgetting}
            onClick={async () => {
              if (await forget()) await navigate({ to: "/onboarding" });
            }}
          >
            Someone else is using it
          </Button>
          <Button variant="outline" onClick={() => setLeaving(true)}>
            Log out
          </Button>
        </div>
      )}
    </div>
  );
}
