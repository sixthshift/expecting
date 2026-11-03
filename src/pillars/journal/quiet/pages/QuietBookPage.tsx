import { PillarLayout } from "../../../../app/components/layout/PillarLayout";

/** The book while something has happened, the route's quiet world (`worlds`): only a line. Everything kept is in the Journal, as it was. */
export function QuietBookPage() {
  return (
    <PillarLayout back={{ to: "/journal", label: "The Journal" }}>
      <div className="max-w-3xl">
        <p className="py-10 text-fg-subtle">Everything you kept is in the Journal, as it was.</p>
      </div>
    </PillarLayout>
  );
}
