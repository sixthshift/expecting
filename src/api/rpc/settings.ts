// The settings: the due date, the baby's colours (the theme) and when
// onboarding finished. One row.

import { queryOptions, type UseSuspenseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { useMemo } from "react";
import { z } from "zod";
import { SettingsRepo } from "../../db/models/settings/repo";
import { type ISODate, isISODate, todayISO } from "../../lib/dates";
import { save, stamped } from "../../lib/outbox";
import { BABY, type Baby } from "../../lib/theme";
import { positionOn } from "../../lib/timeline";
import { getDb } from "../../server/core/db";
import { madeAt } from "../../server/core/madeAt";

const isoDate = z
  .string()
  .refine(isISODate, "a date as YYYY-MM-DD")
  .transform((d) => d as ISODate);

/** The due date, the baby's colours and whether onboarding is done. */
export const getSettings = createServerFn({ method: "GET" }).handler(() => new SettingsRepo(getDb()).get());

export const saveSettings = createServerFn({ method: "POST" })
  .validator(
    z
      .object({
        dueDate: isoDate.nullable().optional(),
        baby: z.enum(Object.keys(BABY) as [Baby, ...Baby[]]).optional(),
      })
      .strict()
  )
  .handler(({ data }) => new SettingsRepo(getDb()).update(data, madeAt()));

/** Onboarding is done: from now on, a new device is only asked who it is. */
export const finishOnboarding = createServerFn({ method: "POST" }).handler(() => {
  const repo = new SettingsRepo(getDb());
  return repo.update({ onboardedAt: repo.get().onboardedAt ?? new Date().toISOString() });
});

/** The settings row: the due date, the baby's colours, when onboarding finished. */
export type Settings = Awaited<ReturnType<typeof getSettings>>;

export const settingsQuery = queryOptions({ queryKey: ["settings"], queryFn: () => getSettings() });

/** The settings' save, through the outbox (src/app/model/outbox.ts): it shows at once, and is sent when it can be. Onboarding's finish isn't one: it waits on the server. */
export const settingsSaves = {
  saveSettings: save({
    key: "saveSettings",
    query: settingsQuery.queryKey,
    send: (data: { dueDate?: ISODate | null; baby?: Baby }, made) => saveSettings({ data, headers: stamped(made) }),
    apply: (settings: Settings, changes) => ({ ...settings, ...Object.fromEntries(Object.entries(changes).filter(([, v]) => v !== undefined)) }),
  }),
};

/** settingsQuery as useSuspenseQuery returns it; `options` (`select`, …) override its defaults. It has no select of its own, so the data is TData. */
export function useSettingsQuery<TData = Settings>(options?: Omit<UseSuspenseQueryOptions<Settings, Error, TData, string[]>, "queryKey" | "queryFn">) {
  return useSuspenseQuery({ ...settingsQuery, ...options } as UseSuspenseQueryOptions<Settings, Error, TData, string[]>);
}

/** Where today falls in the pregnancy; null until there's a due date. */
export function usePosition() {
  const { data: settings } = useSettingsQuery();
  const today = todayISO();
  return useMemo(() => (settings.dueDate ? positionOn(today, settings.dueDate) : null), [settings.dueDate, today]);
}

/** This week; null until there's a due date. */
export function useNow() {
  return usePosition()?.week ?? null;
}
