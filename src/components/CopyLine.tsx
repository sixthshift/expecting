import { Button } from "@sixthshift/design-system/button";
import { cn } from "@sixthshift/design-system/utils";
import { useState } from "react";

/**
 * A line to copy (an address, a link), shown whole and copied with a tap.
 * `className` gives its background, set against the surface it's on.
 */
export function CopyLine({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className={cn("min-w-0 rounded-md px-2 py-1 font-mono text-sm break-all text-fg-strong", className)}>{text}</code>
      <Button
        size="sm"
        variant="outline"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}
