import { Card } from "@sixthshift/design-system/card";
import { cn } from "@sixthshift/design-system/utils";
import type { ReactNode } from "react";
import { Page } from "./Page";

/**
 * A page of one card, with no navigation (logging in, joining, a new
 * password, connecting Claude): on a large screen it sits alone, centred.
 */
export function Alone({ title, subtitle, className, children }: { title: string; subtitle?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <div className="lg:mx-auto lg:flex lg:min-h-dvh lg:max-w-lg lg:items-center">
      <Page title={title} subtitle={subtitle}>
        <Card size="lg" className={cn("w-full max-w-md", className)}>
          {children}
        </Card>
      </Page>
    </div>
  );
}
