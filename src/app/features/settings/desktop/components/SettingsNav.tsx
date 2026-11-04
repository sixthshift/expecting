import { Badge } from "@sixthshift/design-system/badge";
import { useSettingsPage } from "../../contexts/SettingsPageContext";
import { GROUPS, type Group } from "../../model/facts";

/** The sections, in order: the question groups, the extras, something has happened, Claude, then this phone's: its appearance and your account. */
const SECTIONS = [
  ...(Object.entries(GROUPS) as [Group, string][]).map(([id, title]) => ({ id, title })),
  { id: "extras", title: "Extras" },
  { id: "quiet", title: "Something has happened" },
  { id: "claude", title: "Claude" },
  { id: "appearance", title: "Appearance" },
  { id: "account", title: "Account" },
];

/** On a desktop, the sections down the side, each with how many it has still to answer. */
export function SettingsNav() {
  const { waiting } = useSettingsPage();
  return (
    <nav aria-label="Settings" className="sticky top-[calc(var(--top-bar)+2.5rem)] flex flex-col gap-1 print:hidden">
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#settings-${s.id}`}
          onClick={(event) => {
            event.preventDefault();
            document.getElementById(`settings-${s.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="flex min-h-10 items-center justify-between gap-2 rounded-md px-3 text-sm text-fg-normal hover:bg-bg-normal-hovered"
        >
          {s.title}
          {waiting(s.id) > 0 ? (
            <Badge variant="soft" intent="brand" size="sm" aria-label={`${waiting(s.id)} to answer`}>
              {waiting(s.id)}
            </Badge>
          ) : null}
        </a>
      ))}
    </nav>
  );
}
