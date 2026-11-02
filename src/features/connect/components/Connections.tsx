import { Button } from "@sixthshift/design-system/button";
import { useState } from "react";
import { connectionsSaves, useConnections } from "../../../api/rpc/connections";
import { useAccess } from "../../../api/rpc/session";
import { useSave } from "../../../app/hooks/useSave";
import { MCP_PATH } from "../../../lib/connect";
import { formatDate, type ISODate } from "../../../lib/dates";

/** Settings' Claude: the address to add it at, what's connected, and disconnecting one. */
export function Connections() {
  const { data: connections } = useConnections();
  const { data: login } = useAccess({ select: (access) => access.login });
  const disconnect = useSave(connectionsSaves.disconnect);
  const [copied, setCopied] = useState(false);
  const address = `${window.location.origin}${MCP_PATH}`;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border-subtle bg-bg-normal p-4">
      {login ? (
        <>
          <p className="text-sm text-fg-normal">
            Claude can work in Expecting as one of you: read the weeks, the Library and the Journal, and keep what the + keeps. In Claude, add a custom
            connector at this address, then allow it here.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="min-w-0 rounded-md bg-bg-subtle px-2 py-1 font-mono text-sm break-all text-fg-strong">{address}</code>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(address);
                  setCopied(true);
                } catch {
                  setCopied(false);
                }
              }}
            >
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <p className="text-xs text-fg-subtle">The Claude app and claude.ai reach Expecting from the internet, so it needs a public HTTPS address.</p>
        </>
      ) : (
        <p className="text-sm text-fg-normal">Claude can connect only with logins on: without a password, there's nothing to keep anyone else out.</p>
      )}
      {connections.length > 0 ? (
        <ul className="flex flex-col divide-y divide-border-subtle">
          {connections.map((c) => (
            <li key={c.id} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-medium text-fg-strong">
                  {c.clientName}, as {c.personName}
                </span>
                <span className="text-xs text-fg-subtle">Last used {formatDate(c.lastUsedAt.slice(0, 10) as ISODate)}</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => disconnect({ id: c.id })}>
                Disconnect
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
