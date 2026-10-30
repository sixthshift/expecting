import { Button } from "@sixthshift/design-system/button";
import { type ErrorComponentProps, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { Page } from "../../components/Page";
import { isLoggedOut } from "../../lib/errors";
import { loggedOut } from "../model/loggedOut";

/** A page that couldn't load: try again. If the session has ended, off to log in instead. */
export function ErrorPage({ error }: ErrorComponentProps) {
  const router = useRouter();
  const out = isLoggedOut(error);
  useEffect(() => {
    if (out) loggedOut();
  }, [out]);
  if (out) return null;

  return (
    <Page title="That didn't load">
      <div className="flex flex-col items-start gap-4">
        <p>Expecting couldn't reach its server. Check your connection and try again.</p>
        <Button intent="brand" onClick={() => router.invalidate()}>
          Try again
        </Button>
      </div>
    </Page>
  );
}
