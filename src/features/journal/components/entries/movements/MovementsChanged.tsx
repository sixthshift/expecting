import { Message } from "@sixthshift/design-system/message";
import { Link } from "@tanstack/react-router";
import { CallBirthSuite } from "../../../../../app/components/layout/CallBirthSuite";
import { ItemLink } from "../../../../library/components/ItemLink";

/** The entry whose advice this follows, checked against Safer Baby. */
const ADVICE_ITEM = "baby-movements";

/**
 * A movement felt as slower, weaker or stopped: call now. Never "probably
 * fine". The birth suite's number if it's set, and Emergency info, where
 * the midwife's is too. An alert, though a warning is polite by default:
 * the call can't wait for a pause.
 */
export function MovementsChanged() {
  return (
    <Message
      intent="warning"
      role="alert"
      title="Call your midwife or birth unit now."
      actions={
        <>
          <CallBirthSuite layout="button" />
          <Link to="/emergency" className="flex min-h-11 items-center underline">
            Every number, in Emergency info
          </Link>
          <ItemLink itemId={ADVICE_ITEM} className="flex min-h-11 items-center underline">
            Why movements matter
          </ItemLink>
        </>
      }
    >
      If your baby's movements slow down, weaken or stop, contact them straight away, not tomorrow. You are not wasting their time.
    </Message>
  );
}
