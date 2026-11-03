import type { ComponentProps, ReactNode } from "react";
import { type Back, PillarLayout } from "../../../components/layout/PillarLayout";
import { PutAwayNotice } from "../components/PutAwayNotice";

/**
 * A page that's put away while something has happened: its top as it is (the
 * way `back`, its `title` and `lead`, at its `width`), and in place of the
 * page, what's put away (`PutAwayNotice`: `subject` as the sentence starts,
 * `are` when it's plural, `aside` for the to-do list). Drawn by `putAway`.
 */
export function PutAwayPage({
  subject,
  are,
  aside,
  back,
  title,
  lead,
  width,
}: {
  subject: string;
  are?: boolean;
  aside?: boolean;
  back?: Back;
  title?: string;
  lead?: ReactNode;
  width?: ComponentProps<typeof PillarLayout>["width"];
}) {
  return (
    <PillarLayout back={back} title={title} lead={lead} width={width}>
      <PutAwayNotice subject={subject} are={are} aside={aside} className="max-w-prose" />
    </PillarLayout>
  );
}
