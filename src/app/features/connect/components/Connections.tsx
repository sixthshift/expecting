import { Button } from "@sixthshift/design-system/button";
import { connectionsSaves, useConnectionsQuery } from "../../../../api/rpc/connections";
import { useAccessQuery } from "../../../../api/rpc/session";
import { CopyLine } from "../../../../components/CopyLine";
import { MCP_PATH } from "../../../../lib/connect";
import { formatDate, type ISODate } from "../../../../lib/dates";
import { useSave } from "../../../hooks/useSave";

/** Settings' Claude: the address to add it at, what's connected, and disconnecting one. */
export function Connections() {
  const { data: connections } = useConnectionsQuery();
  const { data: login } = useAccessQuery({ select: (access) => access.login });
  const disconnect = useSave(connectionsSaves.disconnect);
  const address = `${window.location.origin}${MCP_PATH}`;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border-subtle bg-bg-normal p-4">
      {login ? (
        <>
          <p className="text-sm text-fg-normal">
            Claude can work in Expecting as one of you: read the weeks, the Library and the Journal, and keep what the + keeps. In Claude, add a custom
            connector at this address, then allow it here.
          </p>
          <CopyLine text={address} className="bg-bg-subtle" />
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
