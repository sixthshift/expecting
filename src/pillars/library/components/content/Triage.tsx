import { Button } from "@sixthshift/design-system/button";
import { Message, MessageActions, MessageBody, MessageDescription, MessageIcon, type MessageIntent, MessageTitle } from "@sixthshift/design-system/message";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Hospital, type LucideIcon, MessageCircleQuestion, Phone, Siren, Stethoscope } from "lucide-react";
import type { ReactNode } from "react";
import { emergencyQuery } from "../../../../api/rpc/emergency";
import type { SYMPTOM_LEVELS } from "../../../../content/schema";
import type { Section } from "../../../../content/sections";
import { type EmergencyInfo, telHref } from "../../../../lib/emergency";
import { Ask } from "./Ask";
import { ItemBody } from "./ItemBody";

type Level = (typeof SYMPTOM_LEVELS)[number];

/** Each level's intent (its colour, from the design system's intents) and mark. */
const LOOK: Record<Level, { intent: MessageIntent; Icon: LucideIcon }> = {
  "Call 000 or go to emergency": { intent: "danger", Icon: Siren },
  "Contact your hospital now": { intent: "warning", Icon: Hospital },
  "See your doctor or midwife": { intent: "brand", Icon: Stethoscope },
  "Mention it at your next visit": { intent: "neutral", Icon: MessageCircleQuestion },
};

/**
 * A symptom's levels, most urgent first, each with what to do about it in one
 * tap: 000, the birth suite's number, your midwife's or GP's from Emergency
 * info, or the question added to your list for the next visit (none from a
 * private entry: the list is shared). Each is a note, not a live region: it's
 * the page, read when it's opened, not news to interrupt with. Its parts, not
 * the props, so its title is a heading. The left edge and the page's own
 * text size are Expecting's.
 */
export function Triage({ levels, question }: { levels: readonly Section[]; question: string | null }) {
  const { data } = useQuery(emergencyQuery);
  return (
    <section aria-labelledby="when-to-get-help" className="flex flex-col gap-3">
      <h2 id="when-to-get-help" className="text-lg font-display font-semibold text-fg-strong">
        When to get help
      </h2>
      {levels.map(({ title, doc }) => {
        const level = title as Level;
        const { intent, Icon } = LOOK[level];
        const actions = actionsFor(level, question, data?.values ?? {});
        return (
          <Message key={level} intent={intent} role="note" className="rounded-xl border-l-4 text-base">
            <MessageIcon>
              <Icon aria-hidden size={16} className="text-(--intent-fg)" />
            </MessageIcon>
            <MessageBody>
              <MessageTitle className="font-semibold text-(--intent-fg)">
                <h3>{level}</h3>
              </MessageTitle>
              <MessageDescription>
                <ItemBody doc={doc} className="max-w-prose" />
              </MessageDescription>
              {actions ? <MessageActions>{actions}</MessageActions> : null}
            </MessageBody>
          </Message>
        );
      })}
    </section>
  );
}

/** What to do at a level, or nothing, so a level with no number to call has no empty row. */
function actionsFor(level: Level, question: string | null, values: EmergencyInfo["values"]): ReactNode {
  switch (level) {
    case "Call 000 or go to emergency":
      return <Call phone="000" label="Call 000" urgent />;
    case "Contact your hospital now":
      return values.birthSuitePhone ? (
        <Call phone={values.birthSuitePhone} label="Call the birth suite" />
      ) : (
        <Link to="/emergency" className="flex min-h-11 items-center underline">
          Add your birth suite's number to Emergency info
        </Link>
      );
    case "See your doctor or midwife":
      return values.carerPhone || values.gpPhone ? (
        <>
          {values.carerPhone ? <Call phone={values.carerPhone} label={values.carer ? `Call ${values.carer}` : "Call your midwife"} /> : null}
          {values.gpPhone ? <Call phone={values.gpPhone} label={values.gp ? `Call ${values.gp}` : "Call your GP"} /> : null}
        </>
      ) : null;
    case "Mention it at your next visit":
      return question === null ? null : <Ask primary={question} className="mt-0 w-full" />;
  }
}

function Call({ phone, label, urgent = false }: { phone: string; label: string; urgent?: boolean }) {
  return (
    <Button asChild intent={urgent ? "danger" : "brand"} size="lg" className="rounded-full">
      <a href={telHref(phone)}>
        <Phone aria-hidden size={16} /> {label}
      </a>
    </Button>
  );
}
