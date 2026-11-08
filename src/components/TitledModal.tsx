import { Modal, type ModalProps } from "@sixthshift/design-system/modal";
import { cn } from "@sixthshift/design-system/utils";
import type { ReactNode } from "react";

/** A modal with its title, which names it, a close button, and a padded body (`className` adds to it). Closing it calls `onClose`. */
export function TitledModal({
  title,
  size = "sm",
  align,
  onClose,
  className,
  children,
}: {
  title: string;
  size?: ModalProps["size"];
  align?: ModalProps["align"];
  onClose: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Modal size={size} align={align} closable onOpenChange={(open) => (open ? null : onClose())} aria-label={title}>
      <Modal.Header>
        <h2 className="font-display text-lg font-semibold text-fg-strong">{title}</h2>
      </Modal.Header>
      <Modal.Body className={cn("px-6 pb-6", className)}>{children}</Modal.Body>
    </Modal>
  );
}
