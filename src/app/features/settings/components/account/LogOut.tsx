import { Button } from "@sixthshift/design-system/button";
import { useState } from "react";
import { logOutEverywhere } from "../../../../../api/rpc/people";
import { logout } from "../../../../../api/rpc/session";
import { logOut } from "../../../../model/loggedOut";

/** Logging out: on this phone, or (with logins on) on every one of yours, each asked first. */
export function LogOut({ login }: { login: boolean }) {
  const [leaving, setLeaving] = useState<"here" | "everywhere" | null>(null);

  const leave = () => logOut(leaving === "everywhere" ? logOutEverywhere : logout);

  if (leaving)
    return (
      <div className="flex flex-col gap-3 rounded-lg bg-bg-subtle p-3">
        <p className="text-sm text-fg-normal">
          {leaving === "everywhere"
            ? "Log out on every phone and computer logged in as you, this one too? Each will ask for your password. Nothing is lost."
            : login
              ? "Log out on this phone? Coming back takes your password. Nothing is lost."
              : "Log out on this phone, to hand it to the other of you? Nothing is lost."}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button intent="danger" onClick={leave}>
            Yes, log out
          </Button>
          <Button variant="outline" onClick={() => setLeaving(null)}>
            Cancel
          </Button>
        </div>
      </div>
    );

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => setLeaving("here")}>
        Log out
      </Button>
      {login ? (
        <Button variant="outline" onClick={() => setLeaving("everywhere")}>
          Log out everywhere
        </Button>
      ) : null}
    </div>
  );
}
