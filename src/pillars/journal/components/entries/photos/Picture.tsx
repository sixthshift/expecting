import { cn } from "@sixthshift/design-system/utils";
import { useUploadSrc } from "../../../../../app/hooks/useUploadSrc";
import type { Variant } from "../../../../../lib/files";

/** An upload's picture: this phone's copy while it's waiting to go up, else the server's. A blank while the phone's copy is read. */
export function Picture({ fileId, variant, alt, className }: { fileId: string; variant: Variant; alt: string; className?: string }) {
  const src = useUploadSrc(fileId, variant);
  if (!src) return <span role="img" aria-label={alt} className={cn("block bg-bg-subtle", className)} />;
  return <img src={src} alt={alt} loading="lazy" decoding="async" className={className} />;
}
