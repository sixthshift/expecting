import { Modal } from "@sixthshift/design-system/modal";
import { cn } from "@sixthshift/design-system/utils";
import type { ReactNode } from "react";
import { SidePanel } from "../desktop/components/panel/SidePanel";
import { useLayout } from "../hooks/useLayout";

/**
 * One thing opened from a list to look at and change: someone in Your
 * people, a line on a list, a first, a bingo square, a line of the story. On
 * a phone a sheet over the page; on a desktop the side panel beside it, so
 * the list stays live and the next one opens in its place (the opener's own
 * state still says whether it's open, and closing it is `onClose` either
 * way). Something to do and be done with (the "+", a question to ask) stays
 * a sheet on both; a photo or a scan takes the whole screen.
 */
export function DetailSheet({
  title,
  label,
  onClose,
  className,
  children,
}: {
  /** Its heading. */
  title: ReactNode;
  /** Its name to a screen reader, where the heading isn't only words. */
  label: string;
  onClose: () => void;
  /** How what's in it is laid out (`flex flex-col gap-4`). */
  className?: string;
  children: ReactNode;
}) {
  if (useLayout() === "desktop") {
    return (
      <SidePanel label={label} title={title} onClose={onClose}>
        <div className={className}>{children}</div>
      </SidePanel>
    );
  }
  return (
    <Modal size="sm" align="top" closable onOpenChange={(open) => (open ? null : onClose())} aria-label={label}>
      <Modal.Header>
        <h2 className="font-display text-lg font-semibold text-fg-strong">{title}</h2>
      </Modal.Header>
      <Modal.Body className={cn("px-6 pb-6", className)}>{children}</Modal.Body>
    </Modal>
  );
}
