// Each query's hook (`use<Thing>Query`, beside its query in ./rpc/): the
// query through useSuspenseQuery, returned as is, with any options (`select`,
// …) overriding its defaults.

import { type QueryKey, type UseSuspenseQueryOptions, useSuspenseQuery } from "@tanstack/react-query";

/** The hook for `query`. It has no select of its own, so the data is TData. */
export function queryHook<T, TKey extends QueryKey>(query: UseSuspenseQueryOptions<T, Error, T, TKey>) {
  return function useQuery<TData = T>(options?: Omit<UseSuspenseQueryOptions<T, Error, TData, TKey>, "queryKey" | "queryFn">) {
    return useSuspenseQuery({ ...query, ...options } as UseSuspenseQueryOptions<T, Error, TData, TKey>);
  };
}
