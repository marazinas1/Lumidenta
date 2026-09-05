import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteTestimonial,
  listAllTestimonials,
  saveTestimonial,
} from "@/lib/catalog-admin.functions";
import { CATALOG_KEY } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin/website/testimonials")({
  component: TestimonialsEditor,
});

type Draft = {
  id?: string;
  quote: string;
  author_name: string;
  author_detail: string | null;
  sort_order: number;
  published: boolean;
};

const emptyDraft = (sortOrder: number): Draft => ({
  quote: "",
  author_name: "",
  author_detail: "",
  sort_order: sortOrder,
  published: true,
});

function TestimonialsEditor() {
  const queryClient = useQueryClient();
  const fetchAll = useServerFn(listAllTestimonials);
  const save = useServerFn(saveTestimonial);
  const remove = useServerFn(deleteTestimonial);

  const { data: rows, isLoading } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: () => fetchAll({}),
  });

  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
    await queryClient.invalidateQueries({ queryKey: CATALOG_KEY });
  };

  const saveMutation = useMutation({
    mutationFn: (value: Draft) =>
      save({ data: { ...value, author_detail: value.author_detail || null } }),
    onSuccess: async () => {
      toast.success("Išsaugota.");
      setDraft(null);
      setOpenId(null);
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: async () => {
      toast.success("Atsiliepimas ištrintas.");
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Atsiliepimai</h1>
          <p className="mt-2 max-w-prose text-sm text-muted-foreground">
            Atsiliepimai rodomi pradžios puslapyje. Šiuo metu įrašyti pavyzdiniai tekstai — juos
            reikia pakeisti tikrais pacientų atsiliepimais.
          </p>
        </div>
        <Button
          onClick={() => {
            setOpenId("new");
            setDraft(emptyDraft((rows?.length ?? 0) * 10 + 10));
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Naujas atsiliepimas
        </Button>
      </div>

      {openId === "new" && draft ? (
        <TestimonialForm
          draft={draft}
          onChange={setDraft}
          onCancel={() => {
            setDraft(null);
            setOpenId(null);
          }}
          onSave={() => saveMutation.mutate(draft)}
          saving={saveMutation.isPending}
        />
      ) : null}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Kraunama…</p>
      ) : (
        <div className="space-y-3">
          {(rows ?? []).map((row) => {
            const id = String((row as Record<string, unknown>)['id']);
            const isOpen = openId === id;
            return (
              <div key={id} className="rounded-xl border border-border/70">
                <div className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{String(row['quote'] ?? "")}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {String(row['author_name'] ?? "")} · eilė {String(row['sort_order'] ?? 0)}
                    </p>
                  </div>
                  {!row['published'] ? (
                    <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                      Paslėpta
                    </span>
                  ) : null}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (isOpen) {
                        setOpenId(null);
                        setDraft(null);
                        return;
                      }
                      setOpenId(id);
                      setDraft({
                        id,
                        quote: String(row['quote'] ?? ""),
                        author_name: String(row['author_name'] ?? ""),
                        author_detail: (row['author_detail'] as string | null) ?? "",
                        sort_order: Number(row['sort_order'] ?? 0),
                        published: Boolean(row['published']),
                      });
                    }}
                  >
                    {isOpen ? (
                      <>
                        <ChevronUp className="mr-2 h-4 w-4" /> Uždaryti
                      </>
                    ) : (
                      <>
                        <ChevronDown className="mr-2 h-4 w-4" /> Redaguoti
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm("Ištrinti šį atsiliepimą?")) deleteMutation.mutate(id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {isOpen && draft ? (
                  <div className="border-t border-border/70 p-4">
                    <TestimonialForm
                      draft={draft}
                      onChange={setDraft}
                      onCancel={() => {
                        setDraft(null);
                        setOpenId(null);
                      }}
                      onSave={() => saveMutation.mutate(draft)}
                      saving={saveMutation.isPending}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TestimonialForm({
  draft,
  onChange,
  onCancel,
  onSave,
  saving,
}: {
  draft: Draft;
  onChange: (value: Draft) => void;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    onChange({ ...draft, [key]: value });

  return (
    <div className="space-y-5 rounded-xl border border-border/70 p-5">
      <div className="space-y-2">
        <Label>Atsiliepimas</Label>
        <Textarea rows={4} value={draft.quote} onChange={(e) => set("quote", e.target.value)} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Vardas</Label>
          <Input
            value={draft.author_name}
            onChange={(e) => set("author_name", e.target.value)}
            placeholder="Vardenė V."
          />
        </div>
        <div className="space-y-2">
          <Label>Papildoma eilutė (nebūtina)</Label>
          <Input
            value={draft.author_detail ?? ""}
            onChange={(e) => set("author_detail", e.target.value)}
            placeholder="Pacientė nuo 2022 m."
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Eilė</Label>
          <Input
            type="number"
            value={draft.sort_order}
            onChange={(e) => set("sort_order", Number(e.target.value) || 0)}
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border/70 px-4 py-3">
          <Label className="text-sm font-normal">Rodoma svetainėje</Label>
          <Switch checked={draft.published} onCheckedChange={(v) => set("published", v)} />
        </div>
      </div>
      <div className="flex gap-3">
        <Button onClick={onSave} disabled={saving}>
          {saving ? "Saugoma…" : "Išsaugoti"}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Atšaukti
        </Button>
      </div>
    </div>
  );
}
