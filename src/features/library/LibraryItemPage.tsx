import { getRouteApi, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarRange } from "lucide-react";
import { builtInItems } from "../../content";
import { slotKey, slotLabel } from "../../lib/timeline";
import { useApp } from "../household/useApp";
import { ItemCard } from "./ItemCard";

const route = getRouteApi("/app/library/$itemId");

/** One item on its own page, with the way to its week on the timeline while there is one. */
export function LibraryItemPage() {
  const { itemId } = route.useParams();
  const { items, state, phase } = useApp();
  const item = items.find((i) => i.id === itemId);
  // Hidden by an answer, rather than not there at all: say so, and where to change it.
  const tailoredOut = !item && builtInItems.some((i) => i.id === itemId);

  return (
    <main className="mx-auto max-w-3xl px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-16 md:px-8 lg:pt-8">
      <Link to="/library" className="-ml-2 mb-4 flex min-h-11 w-fit items-center gap-2 rounded-md px-2 text-sm text-fg-subtle hover:text-fg-normal">
        <ArrowLeft aria-hidden size={16} /> Library
      </Link>
      {item ? (
        <div className="flex flex-col gap-4">
          {/* The card's title is an h3 among weeks; here it is the page's subject. */}
          <h1 className="sr-only">{item.title}</h1>
          <ItemCard item={item} ticks={state.ticks} />
          {phase === "pregnancy" ? (
            <Link
              to="/"
              search={{ at: slotKey(item.from) }}
              className="flex min-h-11 items-center gap-2 self-start text-sm text-fg-subtle hover:text-fg-normal"
            >
              <CalendarRange aria-hidden size={16} className="text-fg-brand" />
              See {slotLabel(item.from).toLowerCase()} on the timeline
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-fg-strong">Not in your library</h1>
          <p className="text-fg-subtle">
            {tailoredOut ? (
              <>
                Your answers in{" "}
                <Link to="/settings" className="underline">
                  settings
                </Link>{" "}
                say this one doesn't apply to you. Change an answer and it comes back.
              </>
            ) : (
              "There's nothing at this address."
            )}
          </p>
        </div>
      )}
    </main>
  );
}
