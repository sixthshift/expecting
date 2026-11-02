import { Link } from "@tanstack/react-router";
import { type ExtraId, extra } from "../../../app/features/settings/model/extras";

/**
 * What a tool that's off says: the extras it comes with, and the way to
 * settings, open at the first of them. "Turn it on" for one extra, "turn one
 * on" for several. A fragment, so it reads as part of its sentence.
 */
export function ComesWith({ extras }: { extras: readonly ExtraId[] }) {
  const names = extras.map((id) => extra(id).name);
  const list = names.length > 1 ? `${names.slice(0, -1).join(", ")} or ${names.at(-1)}` : names[0];
  return (
    <>
      It comes with {list}.{" "}
      <Link to="/settings" search={{ ask: `extra:${extras[0]}` }} className="underline">
        Turn {extras.length > 1 ? "one" : "it"} on in settings
      </Link>
    </>
  );
}
