import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RotateCcw, Check, Clock, Lock, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCanEdit } from "@/components/admin/ReadOnlyNotice";
import { saveText } from "@/lib/page-content-admin.functions";
import { PAGE_CONTENT_KEY } from "@/lib/page-content";
import { useDefaultRequests } from "@/lib/default-requests";

type Props = {
  page: string;
  slot: string;
  label: string;
  /** The wording written into the component — shown when no row exists. */
  fallback: string;
  /** The stored value, empty when the default is in use. */
  value: string;
  multiline?: boolean;
  locale?: "lt" | "en";
};

export function PageTextField({
  page,
  slot,
  label,
  fallback,
  value,
  multiline,
  locale = "lt",
}: Props) {
  const [draft, setDraft] = useState(value);
  const qc = useQueryClient();
  const save = useServerFn(saveText);
  const { canEdit, isDeveloper } = useCanEdit();
  const requests = useDefaultRequests();

  useEffect(() => setDraft(value), [value]);

  const mutation = useMutation({
    mutationFn: (next: string) => save({ data: { page, slot, locale, value: next } }),
    onSuccess: (_res, next) => {
      void qc.invalidateQueries({ queryKey: PAGE_CONTENT_KEY });
      toast.success(next.trim() ? "Išsaugota" : "Atstatyta į numatytąjį tekstą");
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Nepavyko išsaugoti"),
  });

  const dirty = draft !== value;
  const usingDefault = !value.trim();
  const request = requests.latest(page, slot, locale);
  const pendingRequest = request?.status === "pending" ? request : null;
  const notice =
    request && request.status !== "pending" && !request.seen_by_requester ? request : null;

  async function askForDefault() {
    try {
      await requests.request.mutateAsync({ page, slot, locale, value: draft });
      toast.success("Prašymas išsiųstas developeriui.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Nepavyko išsiųsti prašymo");
    }
  }

  async function pinAsDefault() {
    try {
      await requests.pin.mutateAsync({ page, slot, locale, value: draft });
      await qc.invalidateQueries({ queryKey: PAGE_CONTENT_KEY });
      toast.success("Tekstas užrakintas kaip numatytasis.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Nepavyko užrakinti");
    }
  }

  const busy = mutation.isPending || requests.request.isPending || requests.pin.isPending;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label className="text-sm">{label}</Label>
        {usingDefault ? (
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Numatytasis
          </span>
        ) : null}
      </div>

      {multiline ? (
        <Textarea
          rows={3}
          value={draft}
          placeholder={fallback}
          onChange={(e) => setDraft(e.target.value)}
        />
      ) : (
        <Input value={draft} placeholder={fallback} onChange={(e) => setDraft(e.target.value)} />
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" disabled={!dirty || busy} onClick={() => mutation.mutate(draft)}>
          <Check className="mr-1 h-3.5 w-3.5" />
          Išsaugoti
        </Button>
        {!usingDefault ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => mutation.mutate("")}
          >
            <RotateCcw className="mr-1 h-3.5 w-3.5" />
            Atstatyti numatytąjį
          </Button>
        ) : null}

        {canEdit && draft.trim() ? (
          isDeveloper ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => void pinAsDefault()}
            >
              <Lock className="mr-1 h-3.5 w-3.5" />
              Padaryti numatytuoju
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy || Boolean(pendingRequest)}
              onClick={() => void askForDefault()}
            >
              <Lock className="mr-1 h-3.5 w-3.5" />
              Prašyti padaryti numatytuoju
            </Button>
          )
        ) : null}
      </div>

      {pendingRequest ? (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          Prašymas išsiųstas — laukiama developerio patvirtinimo.
        </p>
      ) : null}

      {notice ? (
        <div className="flex items-start justify-between gap-2 rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            {notice.status === "approved" ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <X className="h-3.5 w-3.5" />
            )}
            {notice.status === "approved"
              ? "Šis tekstas patvirtintas kaip numatytasis."
              : "Developeris atmetė prašymą — numatytasis tekstas nepakeistas."}
          </span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs"
            onClick={() => void requests.dismiss.mutateAsync([notice.id])}
          >
            Gerai
          </Button>
        </div>
      ) : null}
    </div>
  );
}
