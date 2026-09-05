import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Pin, PinOff, RotateCcw, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  clearMedia,
  pinDefault,
  saveMedia,
  unpinDefault,
} from "@/lib/page-content-admin.functions";
import { PAGE_CONTENT_KEY } from "@/lib/page-content";
import type { MediaSlot } from "@/lib/page-content.functions";
import { removeFromStorage, uploadOptimizedToStorage } from "@/lib/image-optimize";

type Props = {
  page: string;
  slot: string;
  label: string;
  hint?: string;
  /** Aspect ratio of the live page slot, so the preview matches reality. */
  ratio?: string;
  chosen: MediaSlot | null;
  fallback: MediaSlot | null;
  isDeveloper: boolean;
};

export function PageImageSlot({
  page,
  slot,
  label,
  hint,
  ratio = "3 / 3.7",
  chosen,
  fallback,
  isDeveloper,
}: Props) {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [alt, setAlt] = useState(chosen?.alt ?? "");

  const save = useServerFn(saveMedia);
  const clear = useServerFn(clearMedia);
  const pin = useServerFn(pinDefault);
  const unpin = useServerFn(unpinDefault);

  const active = chosen ?? fallback;
  const layer = chosen ? "Savininko nuotrauka" : fallback ? "Developer numatytoji" : "Nėra nuotraukos";

  const refresh = () => qc.invalidateQueries({ queryKey: PAGE_CONTENT_KEY });

  const onFile = async (file: File) => {
    setBusy(true);
    try {
      const uploaded = await uploadOptimizedToStorage(file, page);
      const previous = chosen?.path;
      await save({
        data: { page, slot, bucket: "site-images", path: uploaded.path, alt },
      });
      if (previous && previous !== uploaded.path) {
        // Never leave orphaned objects behind in storage.
        await removeFromStorage(
          `/storage/v1/object/public/site-images/${previous}`,
        ).catch(() => undefined);
      }
      await refresh();
      toast.success("Nuotrauka įkelta");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Nepavyko įkelti nuotraukos");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const altMutation = useMutation({
    mutationFn: () =>
      save({
        data: {
          page,
          slot,
          bucket: chosen?.bucket ?? "site-images",
          path: chosen?.path ?? "",
          alt,
        },
      }),
    onSuccess: () => {
      void refresh();
      toast.success("Aprašymas išsaugotas");
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Nepavyko išsaugoti"),
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      const previous = chosen?.path;
      await clear({ data: { page, slot } });
      if (previous) {
        await removeFromStorage(`/storage/v1/object/public/site-images/${previous}`).catch(
          () => undefined,
        );
      }
    },
    onSuccess: () => {
      void refresh();
      toast.success("Atstatyta į numatytąją nuotrauką");
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Nepavyko atstatyti"),
  });

  const pinMutation = useMutation({
    mutationFn: () =>
      chosen
        ? pin({
            data: { page, slot, bucket: chosen.bucket, path: chosen.path, alt: chosen.alt },
          })
        : Promise.reject(new Error("Pirma įkelkite nuotrauką")),
    onSuccess: () => {
      void refresh();
      toast.success("Prisegta kaip numatytoji");
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Nepavyko prisegti"),
  });

  const unpinMutation = useMutation({
    mutationFn: () => unpin({ data: { page, slot } }),
    onSuccess: () => {
      void refresh();
      toast.success("Numatytoji nuotrauka pašalinta");
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Nepavyko pašalinti"),
  });

  return (
    <div className="space-y-3 rounded-xl border border-border/70 p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <Label className="text-sm">{label}</Label>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <span className="whitespace-nowrap text-[11px] uppercase tracking-wide text-muted-foreground sm:order-2">
          {layer}
        </span>
      </div>


      <div
        className="relative w-full max-w-[240px] overflow-hidden rounded-lg bg-muted"
        style={{ aspectRatio: ratio }}
      >
        {active ? (
          <img src={active.url} alt={active.alt} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-xs text-muted-foreground">
            Nuotrauka neįkelta
          </div>
        )}
        {busy ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <Input
          value={alt}
          placeholder="Nuotraukos aprašymas (svarbu SEO ir prieinamumui)"
          onChange={(e) => setAlt(e.target.value)}
          onBlur={() => {
            if (chosen && alt !== chosen.alt) altMutation.mutate();
          }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void onFile(file);
          }}
        />
        <Button type="button" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
          <Upload className="mr-1 h-3.5 w-3.5" />
          Įkelti nuotrauką
        </Button>
        {chosen ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy || resetMutation.isPending}
            onClick={() => resetMutation.mutate()}
          >
            <RotateCcw className="mr-1 h-3.5 w-3.5" />
            Atstatyti numatytąją
          </Button>
        ) : null}
        {isDeveloper ? (
          <>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!chosen || pinMutation.isPending}
              onClick={() => pinMutation.mutate()}
            >
              <Pin className="mr-1 h-3.5 w-3.5" />
              Prisegti kaip numatytąją
            </Button>
            {fallback ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={unpinMutation.isPending}
                onClick={() => unpinMutation.mutate()}
              >
                <PinOff className="mr-1 h-3.5 w-3.5" />
                Pašalinti numatytąją
              </Button>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
