import { ReadOnlyNotice, useCanEdit } from "@/components/admin/ReadOnlyNotice";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  deleteService,
  listAllServices,
  saveService,
} from "@/lib/catalog-admin.functions";
import { CATALOG_KEY } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin/website/services")({
  component: ServicesEditor,
});

type ServiceDraft = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  icon: string;
  tone: "t1" | "t2" | "t3" | "t4";
  includes: string[];
  sort_order: number;
  published: boolean;
  show_on_home: boolean;
};

const TONES: { value: ServiceDraft["tone"]; label: string }[] = [
  { value: "t1", label: "Žalsva" },
  { value: "t2", label: "Kreminė" },
  { value: "t3", label: "Alyvinė" },
  { value: "t4", label: "Persikinė" },
];

const emptyDraft = (sortOrder: number): ServiceDraft => ({
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  icon: "",
  tone: "t1",
  includes: [],
  sort_order: sortOrder,
  published: true,
  show_on_home: false,
});

function ServicesEditor() {
  const { canEdit } = useCanEdit();
  const queryClient = useQueryClient();
  const fetchAll = useServerFn(listAllServices);
  const save = useServerFn(saveService);
  const remove = useServerFn(deleteService);

  const { data: rows, isLoading } = useQuery({
    queryKey: ["admin-services"],
    queryFn: () => fetchAll({}),
  });

  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ServiceDraft | null>(null);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-services"] });
    await queryClient.invalidateQueries({ queryKey: CATALOG_KEY });
  };

  const saveMutation = useMutation({
    mutationFn: (value: ServiceDraft) => save({ data: value }),
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
      toast.success("Paslauga ištrinta.");
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const startEdit = (row: Record<string, unknown>) => {
    setOpenId(String(row['id']));
    setDraft({
      id: String(row['id']),
      slug: String(row['slug'] ?? ""),
      title: String(row['title'] ?? ""),
      excerpt: String(row['excerpt'] ?? ""),
      body: String(row['body'] ?? ""),
      icon: String(row['icon'] ?? ""),
      tone: (row['tone'] as ServiceDraft["tone"]) ?? "t1",
      includes: Array.isArray(row['includes']) ? (row['includes'] as string[]) : [],
      sort_order: Number(row['sort_order'] ?? 0),
      published: Boolean(row['published']),
      show_on_home: Boolean(row['show_on_home']),
    });
  };

  return (
    <fieldset disabled={!canEdit} className="block space-y-8">
      <ReadOnlyNotice canEdit={canEdit} />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Paslaugos</h1>
          <p className="mt-2 max-w-prose text-sm text-muted-foreground">
            Paslaugos rodomos pradžios puslapyje ir turi savo atskirą puslapį. Eiliškumą nustato
            skaičius „Eilė“ — mažesnis rodomas pirmas.
          </p>
        </div>
        <Button
          onClick={() => {
            setOpenId("new");
            setDraft(emptyDraft((rows?.length ?? 0) * 10 + 10));
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Nauja paslauga
        </Button>
      </div>

      {openId === "new" && draft ? (
        <ServiceForm
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
                  <span className="text-lg">{String(row['icon'] ?? "")}</span>
                  <div className="w-full min-w-0 sm:w-auto sm:flex-1">
                    <p className="truncate font-medium">{String(row['title'] ?? "")}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      /paslaugos/{String(row['slug'] ?? "")} · eilė {String(row['sort_order'] ?? 0)}
                    </p>
                  </div>
                  {!row['published'] ? (
                    <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                      Paslėpta
                    </span>
                  ) : null}
                  {row['show_on_home'] ? (
                    <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                      Pradžios puslapyje
                    </span>
                  ) : null}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (isOpen ? (setOpenId(null), setDraft(null)) : startEdit(row))}
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
                      if (confirm("Ištrinti šią paslaugą?")) deleteMutation.mutate(id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {isOpen && draft ? (
                  <div className="border-t border-border/70 p-4">
                    <ServiceForm
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
    </fieldset>
  );
}

function ServiceForm({
  draft,
  onChange,
  onCancel,
  onSave,
  saving,
}: {
  draft: ServiceDraft;
  onChange: (value: ServiceDraft) => void;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  const set = <K extends keyof ServiceDraft>(key: K, value: ServiceDraft[K]) =>
    onChange({ ...draft, [key]: value });

  return (
    <div className="space-y-5 rounded-xl border border-border/70 p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Pavadinimas</Label>
          <Input value={draft.title} onChange={(e) => set("title", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Adresas (slug)</Label>
          <Input
            value={draft.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="dantu-gydymas"
          />
        </div>
        <div className="space-y-2">
          <Label>Ženkliukas</Label>
          <Input value={draft.icon} onChange={(e) => set("icon", e.target.value)} maxLength={4} />
        </div>
        <div className="space-y-2">
          <Label>Kortelės spalva</Label>
          <Select value={draft.tone} onValueChange={(v) => set("tone", v as ServiceDraft["tone"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TONES.map((tone) => (
                <SelectItem key={tone.value} value={tone.value}>
                  {tone.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Trumpas aprašymas (kortelėje)</Label>
        <Textarea
          rows={2}
          value={draft.excerpt}
          onChange={(e) => set("excerpt", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Pilnas tekstas (paslaugos puslapyje)</Label>
        <Textarea rows={7} value={draft.body} onChange={(e) => set("body", e.target.value)} />
        <p className="text-xs text-muted-foreground">Kiekviena nauja eilutė — atskira pastraipa.</p>
      </div>

      <div className="space-y-2">
        <Label>Ką apima (po vieną eilutėje)</Label>
        <Textarea
          rows={4}
          value={draft.includes.join("\n")}
          onChange={(e) =>
            set(
              "includes",
              e.target.value.split("\n").map((line) => line.trim()).filter(Boolean),
            )
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
        <div className="flex items-center justify-between rounded-lg border border-border/70 px-4 py-3">
          <Label className="text-sm font-normal">Pradžios puslapyje</Label>
          <Switch checked={draft.show_on_home} onCheckedChange={(v) => set("show_on_home", v)} />
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
