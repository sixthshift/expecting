import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
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

/** Letting Claude (or another MCP client) into Expecting, as whoever is logged in, or not. */
export function ConnectPage() {
  const search = route.useSearch();
  const { data: known } = useSuspenseQuery(connectRequestQuery(search.client_id ?? "", search.redirect_uri ?? ""));
  const { data: me } = usePeopleQuery({ select: (people) => people.me });
  const request = authorisation.safeParse(search);
  const [allow, allowing] = useAction(async () => window.location.assign((await approveConnection({ data: { request: request.data! } })).to));

  const refused = !known.ok ? REFUSED[known.why] : !request.success ? REFUSED["bad-request"] : null;

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
                <p className="text-fg-subtle">What it keeps is kept as {me ? me.name : "you"}. Disconnect it in Settings any time.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button loading={allowing} onClick={() => allow()}>
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
