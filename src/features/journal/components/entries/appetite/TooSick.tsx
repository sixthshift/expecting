import { Message } from "@sixthshift/design-system/message";
import { Link } from "@tanstack/react-router";
import { CallBirthSuite } from "../../../../../app/components/layout/CallBirthSuite";
import { ItemLink } from "../../../../library/components/ItemLink";

/** The entries whose words this follows, each checked against its source. */
export const SEVERE = "severe-vomiting";

/**
 * Can't keep fluids down: call now, from `severe-vomiting`'s checked words.
 * The birth suite's number if it's set, and Emergency info, where the
 * midwife's and the GP's are too. Never "probably fine". An alert, though a
 * warning is polite by default: the call can't wait for a pause.
 */
export function TooSick() {
  return (
    <Message
      intent="warning"
      role="alert"
      title="Call your doctor, midwife or hospital now."
      actions={
        <>
          <CallBirthSuite layout="button" />
          <Link to="/emergency" className="flex min-h-11 items-center underline">
            Every number, in Emergency info
          </Link>
          <ItemLink itemId={SEVERE} className="flex min-h-11 items-center underline">
            When sickness is more than morning sickness
          </ItemLink>
        </>
      }
    >
      If you can't keep fluids down at all, go to your local emergency department: they can give you fluids through a drip. There is treatment, and you deserve
      to be heard.
    </Message>
  );
}
