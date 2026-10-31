import { useState } from "react";
import { ReleaseNotes } from "../../../../app/components/WhatsNew";
import { compareVersions, releases } from "../../../../content/releases";
import { COMMIT, VERSION } from "../../../../lib/version";

/** The version this phone is running, and every release's notes up to it, to read again whenever you like. */
export function Version() {
  const [open, setOpen] = useState(false);
  const shown = releases.filter((r) => compareVersions(r.version, VERSION) <= 0);

  return (
    <div className="flex flex-wrap items-center gap-x-2 text-xs text-fg-subtle">
      <span>
        Expecting {VERSION}
        {COMMIT ? ` · ${COMMIT}` : ""}
      </span>
      {shown.length > 0 ? (
        <>
          <span aria-hidden>·</span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="underline underline-offset-2 hover:text-fg-normal focus-visible:outline-2 focus-visible:outline-focus-ring"
          >
            What's changed
          </button>
        </>
      ) : null}
      {open ? <ReleaseNotes title="What's changed in Expecting" shown={shown} onClose={() => setOpen(false)} /> : null}
    </div>
  );
}
