import { Outlet } from "@tanstack/react-router";
import { useSettingsQuery } from "../../../api/rpc/settings";
import { useAppTheme } from "../../../app/hooks/useAppTheme";

/** Around every step: the baby's colours. */
export function OnboardingLayout() {
  const { data: baby } = useSettingsQuery({ select: (s) => s.baby });
  useAppTheme(baby);
  return <Outlet />;
}
