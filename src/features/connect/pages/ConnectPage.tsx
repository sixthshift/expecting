import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { RadioButtonGroup } from "@sixthshift/design-system/radio-button-group";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useState } from "react";
import { approveConnection, connectRequestQuery } from "../../../api/rpc/connections";
import { usePeopleQuery } from "../../../api/rpc/people";
import { useAction } from "../../../app/hooks/useAction";
import { Page } from "../../../components/Page";
import { authorisation, sendBack } from "../../../lib/connect";

const route = getRouteApi("/connect");

/** Why a request can't go ahead, in words; nothing is sent back to the client. */
const REFUSED = {
  "login-off": "Logins are off (EXPECTING_LOGIN=off), so there's no password to stand between Expecting and anyone else. Turn them on to connect.",
  "unknown-client": "This didn't come from anything Expecting knows. Start connecting again from Claude.",
  "bad-redirect": "This didn't come from anything Expecting knows. Start connecting again from Claude.",
  "bad-request": "This link is missing something it needs. Start connecting again from Claude.",
} as const;

/** Letting Claude (or another MCP client) into Expecting: as whom, and whether at all. */
export function ConnectPage() {
  const search = route.useSearch();
  const { data: known } = useSuspenseQuery(connectRequestQuery(search.client_id ?? "", search.redirect_uri ?? ""));
  const { data: people } = usePeopleQuery();
  const request = authorisation.safeParse(search);
  const [personId, setPersonId] = useState(people.me?.id ?? people.people[0]?.id ?? "");
  const [allow, allowing] = useAction(async () => window.location.assign((await approveConnection({ data: { request: request.data!, personId } })).to));

  const refused = !known.ok
    ? REFUSED[known.why]
    : !request.success
      ? REFUSED["bad-request"]
      : people.people.length === 0
        ? "Set Expecting up first, then connect."
        : null;

  return (
    // No navigation here, as at /login: on a large screen the card sits alone, centred.
    <div className="lg:mx-auto lg:flex lg:min-h-dvh lg:max-w-lg lg:items-center">
      <Page
        title={known.ok ? `Connect ${known.clientName}` : "Connect"}
        subtitle={known.ok && !refused ? `Let ${known.clientName} into Expecting?` : undefined}
      >
        <Card size="lg" className="flex w-full max-w-md flex-col gap-5">
          {refused || !known.ok || !request.success ? (
            <p className="text-sm text-fg-normal">{refused}</p>
          ) : (
            <>
              <div className="flex flex-col gap-2 text-sm text-fg-normal">
                <p>
                  It can read everything here: the weeks, the Library, your to do, the Journal, and your photos and papers too. It can keep what the + keeps and
                  tick off what's done.
                </p>
                <p className="text-fg-subtle">What it keeps is kept as whoever you choose. Disconnect it in Settings any time.</p>
              </div>
              {people.people.length > 1 ? (
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-fg-strong">Who's connecting?</p>
                  <RadioButtonGroup
                    aria-label="Who's connecting"
                    options={people.people.map((p) => ({ value: p.id, label: p.name }))}
                    value={personId}
                    onValueChange={setPersonId}
                  />
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button loading={allowing} disabled={!personId} onClick={() => allow()}>
                  Allow
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.assign(sendBack(request.data.redirect_uri, { error: "access_denied" }, request.data.state))}
                >
                  Not now
                </Button>
              </div>
            </>
          )}
        </Card>
      </Page>
    </div>
  );
}
