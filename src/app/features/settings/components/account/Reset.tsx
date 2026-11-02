import { Button } from "@sixthshift/design-system/button";
import { useState } from "react";
import { makeReset } from "../../../../../api/rpc/people";
import { CodeLink } from "./CodeLink";

/** A link for the other of you to choose a new password, made on a tap. */
export function Reset({ name }: { name: string }) {
  const [reset, setReset] = useState<{ code: string; expiresAt: string } | null>(null);
  const [pending, setPending] = useState(false);
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
        setPending(true);
        try {
          setReset(await makeReset());
        } finally {
          setPending(false);
        }
      }}
    >
      {name} forgot their password
    </Button>
  );
}
