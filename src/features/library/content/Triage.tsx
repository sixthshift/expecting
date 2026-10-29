import { Button } from "@sixthshift/design-system/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Hospital, type LucideIcon, MessageCircleQuestion, Phone, Siren, Stethoscope } from "lucide-react";
import type { ReactNode } from "react";
import type { SYMPTOM_LEVELS } from "../../../content/schema";
import type { Section } from "../../../content/sections";
import { telHref } from "../../../lib/emergency";
import { emergencyQuery } from "../../household/load";
import { Ask } from "./Ask";
import { ItemBody } from "./ItemBody";

type Level = (typeof SYMPTOM_LEVELS)[number];

/** Each level's colour and mark. Semantic tokens only, spelled out so Tailwind sees them. */
const LOOK: Record<Level, { box: string; heading: string; Icon: LucideIcon }> = {
  "Call 000 or go to emergency": { box: "border-border-danger bg-bg-danger-subtle", heading: "text-fg-danger", Icon: Siren },
  "Contact your hospital now": { box: "border-border-warning bg-bg-warning-subtle", heading: "text-fg-warning", Icon: Hospital },
  "See your doctor or midwife": { box: "border-border-brand bg-bg-brand-subtle", heading: "text-fg-brand", Icon: Stethoscope },
  "Mention it at your next visit": { box: "border-border-subtle bg-bg-normal", heading: "text-fg-strong", Icon: MessageCircleQuestion },
};

/**
 * A symptom's levels, most urgent first, each with what to do about it in one
 * tap: 000, the birth suite's number, your midwife's or GP's from Emergency
 * info, or the question added to your list for the next visit.
 */
export function Triage({ levels, question }: { levels: readonly Section[]; question: string }) {
  return (
    <section aria-labelledby="when-to-get-help" className="flex flex-col gap-3">
      <h2 id="when-to-get-help" className="text-lg font-display font-semibold text-fg-strong">
        When to get help
      </h2>
      {levels.map(({ title, doc }) => {
        const level = title as Level;
        const { box, heading, Icon } = LOOK[level];
        return (
          <div key={level} className={`flex flex-col gap-1 rounded-xl border-l-4 p-4 ${box}`}>
            <h3 className={`flex items-center gap-2 font-semibold ${heading}`}>
              <Icon aria-hidden size={18} />
              {level}
            </h3>
            <ItemBody doc={doc} className="max-w-prose" />
            <Action level={level} question={question} />
          </div>
        );
      })}
    </section>
  );
}

function Action({ level, question }: { level: Level; question: string }) {
  const { data } = useQuery(emergencyQuery);
  const values = data?.values ?? {};
  switch (level) {
    case "Call 000 or go to emergency":
      return (
        <Actions>
          <Call phone="000" label="Call 000" urgent />
        </Actions>
      );
    case "Contact your hospital now":
      return (
        <Actions>
          {values.birthSuitePhone ? (
            <Call phone={values.birthSuitePhone} label="Call the birth suite" />
          ) : (
            <Link to="/drawer/emergency" className="flex min-h-11 items-center text-sm text-fg-normal underline">
              Add your birth suite's number to Emergency info
            </Link>
          )}
        </Actions>
      );
    case "See your doctor or midwife":
      return values.carerPhone || values.gpPhone ? (
        <Actions>
          {values.carerPhone ? <Call phone={values.carerPhone} label={values.carer ? `Call ${values.carer}` : "Call your midwife"} /> : null}
          {values.gpPhone ? <Call phone={values.gpPhone} label={values.gp ? `Call ${values.gp}` : "Call your GP"} /> : null}
        </Actions>
      ) : null;
    case "Mention it at your next visit":
      return <Ask primary={question} />;
  }
}

function Actions({ children }: { children: ReactNode }) {
  return <div className="mt-3 flex flex-wrap gap-2">{children}</div>;
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
