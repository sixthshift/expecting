import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

/**
 * Go to `href`, once, in place of this page. Not the router's <Navigate>: it
 * navigates again whenever it re-renders with new props, and a page that
 * redirects re-renders while that navigation is pending (the location and
 * the data change under it), which loops. Keyed on the href, this goes
 * once per place to go.
 */
export function Redirect({ href }: { href: string }) {
  const navigate = useNavigate();
  useEffect(() => {
    void navigate({ href, replace: true });
  }, [navigate, href]);
  return null;
}
