import { Button } from "@sixthshift/design-system/button";
import { useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useCallback, useEffect } from "react";

/**
 * On a private entry's page, held at the top as it scrolls: one tap (or Esc)
 * goes to This week, replacing the page in the history so Back doesn't return
 * to it. This week, not another site: it's always there, offline too, it opens
 * at once, and on a phone with the app it looks like nothing at all.
 */
export function QuickExit() {
  const navigate = useNavigate();
  const exit = useCallback(() => navigate({ to: "/", replace: true }), [navigate]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") exit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exit]);

  return (
    <div className="sticky top-[max(0.5rem,env(safe-area-inset-top))] z-10 mb-4 flex items-center gap-3 rounded-xl border border-border-subtle bg-bg-normal p-3 shadow-sm">
      <p className="flex-1 text-sm text-fg-subtle">
        Nothing on this page is saved or shown on the other phone.<span className="hidden lg:inline"> Esc leaves it.</span>
      </p>
      <Button intent="brand" variant="solid" size="lg" className="shrink-0 rounded-full" onClick={exit}>
        <LogOut aria-hidden size={16} /> Quick exit
      </Button>
    </div>
  );
}
