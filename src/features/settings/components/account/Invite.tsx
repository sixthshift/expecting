import { Button } from "@sixthshift/design-system/button";
import { useState } from "react";
import { makeInvite } from "../../../../api/rpc/people";
import { CodeLink } from "./CodeLink";

/** An invite for the other of you, while there's a place: made on a tap, a new one ending the last. */
export function Invite({ who }: { who: string }) {
  const [invite, setInvite] = useState<{ code: string; expiresAt: string } | null>(null);
  const [pending, setPending] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-fg-normal">There's a place for {who}. Send them an invite: they choose their own name and password.</p>
      {invite ? (
        <CodeLink path="/join" code={invite.code} expiresAt={invite.expiresAt}>
          Send them this link. A new invite ends this one.
        </CodeLink>
      ) : null}
      <Button
        variant="outline"
        className="self-start"
        loading={pending}
        onClick={async () => {
          setPending(true);
          try {
            setInvite(await makeInvite());
          } finally {
            setPending(false);
          }
        }}
      >
        {invite ? "A new invite" : `Invite ${who}`}
      </Button>
    </div>
  );
}
