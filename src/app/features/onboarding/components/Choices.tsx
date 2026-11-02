import { useState } from "react";
import { Choice } from "../../../../components/Choice";

/** Big answers, one tap each: choosing one is answering. */
export function Choices({
  options,
  value,
  onChoose,
}: {
  options: { value: string; label: string }[];
  value?: string;
  onChoose: (value: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-3">
      {options.map((o) => (
        <Choice
          key={o.value}
          chosen={o.value === value}
          disabled={busy !== null}
          busy={busy === o.value}
          onClick={async () => {
            setBusy(o.value);
            try {
              await onChoose(o.value);
            } finally {
              setBusy(null);
            }
          }}
        >
          {o.label}
        </Choice>
      ))}
    </div>
  );
}
