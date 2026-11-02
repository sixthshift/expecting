import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { DOOR_INFO, type Door, doorOf } from "../../../../lib/library/doors";
import { useLibraryItemPage } from "../../contexts/LibraryItemPageContext";

/**
 * Back to where it was found. Opened from one of the Library's lists, that's
 * Back, to the list as you left it, scrolled where you were (the router keeps
 * the Library's places, src/router.tsx). Otherwise, the door it's behind; from
 * a private entry, in its place in the history.
 */
export function WayBack() {
  const { item } = useLibraryItemPage();
  const router = useRouter();
  const from = useRouterState({ select: (s) => s.location.state.from });
  const list = from !== undefined && from.split("?")[0] === "/library" ? new URLSearchParams(from.split("?")[1] ?? "") : undefined;
  const door = list?.get("door");
  const label = list ? (door && door in DOOR_INFO ? DOOR_INFO[door as Door].title : "Library") : item ? DOOR_INFO[doorOf(item)].title : "Library";
  return (
    <Link
      to="/library"
      search={item ? { door: doorOf(item) } : {}}
      replace={item?.private}
      onClick={(e) => {
        if (!list) return;
        e.preventDefault();
        router.history.back();
      }}
      className="-ml-2 mb-4 flex min-h-11 w-fit items-center gap-2 rounded-md px-2 text-sm text-fg-subtle hover:text-fg-normal"
    >
      <ArrowLeft aria-hidden size={16} /> {label}
    </Link>
  );
}
