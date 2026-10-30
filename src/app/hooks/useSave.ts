import { useMutation, useQueryClient } from "@tanstack/react-query";
import { peopleQuery } from "../../api/rpc/people";
import { newId, type Save } from "../../lib/outbox";
import type { Waiting } from "../model/outbox";

/**
 * A save through the outbox (src/app/model/outbox.ts), defined beside its
 * server function: it shows at once and is done, as far as the page is
 * concerned; it is kept on this phone and sent when there's a connection,
 * however long that takes. One the server turns away is put back, and says
 * so. Made by the person holding this phone, now.
 */
export function useSave<Input, Data>(save: Save<Input, Data>): (input: Input) => void {
  const queryClient = useQueryClient();
  const { mutate } = useMutation<unknown, Error, Waiting<Input>>({ mutationKey: [save.key] });
  return (input) => {
    const by = queryClient.getQueryData(peopleQuery.queryKey)?.me?.id ?? null;
    mutate({ id: newId(), made: { at: new Date().toISOString(), by }, input });
  };
}
