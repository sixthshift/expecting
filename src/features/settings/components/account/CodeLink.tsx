import { Button } from "@sixthshift/design-system/button";
import { type ReactNode, useState } from "react";

/** A link and its code, made on a tap, to copy and send. */
export function CodeLink({ path, code, expiresAt, children }: { path: string; code: string; expiresAt: string; children: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}${path}?code=${encodeURIComponent(code)}`;
  const until = new Date(expiresAt).toLocaleString("en-AU", { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" });
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-bg-subtle p-3">
      <p className="text-sm text-fg-normal">{children}</p>
      <div className="flex flex-wrap items-center gap-2">
        <code className="min-w-0 rounded-md bg-bg-normal px-2 py-1 font-mono text-sm break-all text-fg-strong">{url}</code>
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <p className="text-xs text-fg-subtle">
        Or the code, to type at {window.location.host}
        {path}: <span className="font-mono text-fg-strong">{code}</span>. Works once, until {until}.
      </p>
    </div>
  );
}
