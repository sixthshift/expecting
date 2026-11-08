import { Button } from "@sixthshift/design-system/button";
import type { LucideIcon } from "lucide-react";
import type { ChangeEvent } from "react";

/** A file input dressed as a button: the phone's camera (the rear one, one picture), or its picker (any of `accept`, several at once). */
export function Pick({
  label,
  icon: Icon,
  accept = "image/*",
  camera = false,
  primary = false,
  size = "lg",
  onFiles,
}: {
  label: string;
  icon: LucideIcon;
  accept?: string;
  camera?: boolean;
  primary?: boolean;
  size?: "sm" | "lg";
  onFiles: (files: File[]) => void;
}) {
  function picked(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    // So choosing the same file again still counts.
    event.target.value = "";
    onFiles(files);
  }
  return (
    <Button asChild intent={primary ? "brand" : undefined} variant={primary ? undefined : "outline"} size={size}>
      <label className="cursor-pointer focus-within:ring-2 focus-within:ring-border-focus">
        <Icon aria-hidden size={size === "lg" ? 20 : 16} />
        {label}
        <input
          type="file"
          accept={camera ? "image/*" : accept}
          capture={camera ? "environment" : undefined}
          multiple={!camera}
          className="sr-only"
          onChange={picked}
        />
      </label>
    </Button>
  );
}
