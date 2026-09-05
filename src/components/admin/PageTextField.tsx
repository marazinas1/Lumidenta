import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RotateCcw, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveText } from "@/lib/page-content-admin.functions";
import { PAGE_CONTENT_KEY } from "@/lib/page-content";

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

  useEffect(() => setDraft(value), [value]);

  const mutation = useMutation({
    mutationFn: (next: string) =>
      save({ data: { page, slot, locale, value: next } }),
    onSuccess: (_res, next) => {
      void qc.invalidateQueries({ queryKey: PAGE_CONTENT_KEY });
      toast.success(next.trim() ? "Išsaugota" : "Atstatyta į numatytąjį tekstą");
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Nepavyko išsaugoti"),
  });

  const dirty = draft !== value;
  const usingDefault = !value.trim();

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

      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          disabled={!dirty || mutation.isPending}
          onClick={() => mutation.mutate(draft)}
        >
          <Check className="mr-1 h-3.5 w-3.5" />
          Išsaugoti
        </Button>
        {!usingDefault ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate("")}
          >
            <RotateCcw className="mr-1 h-3.5 w-3.5" />
            Atstatyti numatytąjį
          </Button>
        ) : null}
      </div>
    </div>
  );
}
