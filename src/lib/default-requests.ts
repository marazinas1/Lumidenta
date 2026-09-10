import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import {
  createDefaultTextRequest,
  listDefaultTextRequests,
  markDefaultTextRequestsSeen,
  resolveDefaultTextRequest,
  pinDefaultText,
  type DefaultTextRequest,
} from "./default-requests.functions";

export const DEFAULT_REQUESTS_KEY = ["default-text-requests"] as const;

/**
 * "Make my wording the default": the owner asks, the developer decides.
 * Nothing on the public site changes until a developer approves.
 */
export function useDefaultRequests() {
  const qc = useQueryClient();
  const list = useServerFn(listDefaultTextRequests);
  const create = useServerFn(createDefaultTextRequest);
  const resolveFn = useServerFn(resolveDefaultTextRequest);
  const pinFn = useServerFn(pinDefaultText);
  const seenFn = useServerFn(markDefaultTextRequestsSeen);

  const { data: all = [] } = useQuery({
    queryKey: DEFAULT_REQUESTS_KEY,
    queryFn: () => list({}),
    retry: false,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: DEFAULT_REQUESTS_KEY });

  const request = useMutation({
    mutationFn: (v: { page: string; slot: string; locale: "lt" | "en"; value: string }) =>
      create({ data: v }),
    onSuccess: invalidate,
  });

  const pin = useMutation({
    mutationFn: (v: { page: string; slot: string; locale: "lt" | "en"; value: string }) =>
      pinFn({ data: v }),
    onSuccess: invalidate,
  });

  const resolve = useMutation({
    mutationFn: (v: { id: string; approve: boolean }) => resolveFn({ data: v }),
    onSuccess: invalidate,
  });

  const dismiss = useMutation({
    mutationFn: (ids: string[]) => seenFn({ data: { ids } }),
    onSuccess: invalidate,
  });

  function latest(page: string, slot: string, locale: string): DefaultTextRequest | null {
    return all.find((r) => r.page === page && r.slot === slot && r.locale === locale) ?? null;
  }

  return {
    all,
    pending: all.filter((r) => r.status === "pending"),
    notices: all.filter((r) => r.status !== "pending" && !r.seen_by_requester),
    latest,
    request,
    pin,
    resolve,
    dismiss,
  };
}
