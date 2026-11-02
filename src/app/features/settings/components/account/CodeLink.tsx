import type { ReactNode } from "react";
import { CopyLine } from "../../../../../components/CopyLine";

/** A link and its code, made on a tap, to copy and send. */
export function CodeLink({ path, code, expiresAt, children }: { path: string; code: string; expiresAt: string; children: ReactNode }) {
  const url = `${window.location.origin}${path}?code=${encodeURIComponent(code)}`;
  const until = new Date(expiresAt).toLocaleString("en-AU", { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" });
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-bg-subtle p-3">
      <p className="text-sm text-fg-normal">{children}</p>
      <CopyLine text={url} className="bg-bg-normal" />
      <p className="text-xs text-fg-subtle">
        Or the code, to type at {window.location.host}
        {path}: <span className="font-mono text-fg-strong">{code}</span>. Works once, until {until}.
      </p>
    </div>
  );
}
