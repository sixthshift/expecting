import { Button } from "@sixthshift/design-system/button";
import { useState } from "react";
import { makeReset } from "../../../../../api/rpc/people";
import { usePending } from "../../../../hooks/usePending";
import { CodeLink } from "./CodeLink";

/** A link for the other of you to choose a new password, made on a tap. */
export function Reset({ name }: { name: string }) {
  const [reset, setReset] = useState<{ code: string; expiresAt: string } | null>(null);
  const [pending, run] = usePending();
  if (reset)
    return (
      <CodeLink path="/reset" code={reset.code} expiresAt={reset.expiresAt}>
        Send {name} this link to choose a new password. Using it logs out every phone of theirs.
      </CodeLink>
    );
  return (
    <Button
      variant="outline"
      className="self-start"
      loading={pending}
      onClick={async () => {
        await run(async () => {
          setReset(await makeReset());
        });
      }}
    >
      {name} forgot their password
    </Button>
  );
}
