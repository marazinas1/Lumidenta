import { ReadOnlyNotice, useCanEdit } from "@/components/admin/ReadOnlyNotice";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Plus, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { deletePost, listAllPosts, savePost } from "@/lib/catalog-admin.functions";
import { CATALOG_KEY } from "@/lib/catalog";
import { removeFromStorage, uploadOptimizedToStorage } from "@/lib/image-optimize";

export const Route = createFileRoute("/_authenticated/admin/website/posts")({
  component: PostsEditor,
});

type Draft = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  author: string;
  image_path: string | null;
  image_alt: string;
  seo_title: string;
  seo_description: string;
  published: boolean;
  show_on_home: boolean;
  published_at: string;
};

const SUPABASE_URL = import.meta.env['VITE_SUPABASE_URL'] as string | undefined;

const publicUrl = (path: string | null) =>
  path ? `${SUPABASE_URL}/storage/v1/object/public/site-images/${path}` : null;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120);

const emptyDraft = (): Draft => ({
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  author: "",
  image_path: null,
  image_alt: "",
  seo_title: "",
  seo_description: "",
  published: false,
  show_on_home: true,
  published_at: new Date().toISOString().slice(0, 10),
});

function PostsEditor() {
  const queryClient = useQueryClient();
  const fetchAll = useServerFn(listAllPosts);
  const save = useServerFn(savePost);
  const remove = useServerFn(deletePost);

  const { data: rows, isLoading } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: () => fetchAll({}),
  });

  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
    await queryClient.invalidateQueries({ queryKey: CATALOG_KEY });
  };

  const saveMutation = useMutation({
    mutationFn: (value: Draft) =>
      save({
        data: {
          ...value,
          slug: value.slug || slugify(value.title),
          published_at: new Date(value.published_at).toISOString(),
        },
      }),
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
      toast.success("Straipsnis ištrintas.");
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <fieldset disabled={!canEdit} className="block space-y-8">
      <ReadOnlyNotice canEdit={canEdit} />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Straipsniai</h1>
          <p className="mt-2 max-w-prose text-sm text-muted-foreground">
            Straipsniai rodomi puslapyje „Straipsniai“. Nepublikuoti įrašai matomi tik čia.
          </p>
        </div>
        <Button
          onClick={() => {
            setOpenId("new");
            setDraft(emptyDraft());
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Naujas straipsnis
        </Button>
      </div>

      {openId === "new" && draft ? (
        <PostForm
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
            const record = row as Record<string, unknown>;
            const id = String(record['id']);
            const isOpen = openId === id;
            return (
              <div key={id} className="rounded-xl border border-border/70">
                <div className="flex flex-wrap items-center gap-3 p-4">
                  <div className="w-full min-w-0 sm:w-auto sm:flex-1">
                    <p className="truncate text-sm font-medium">{String(record['title'] ?? "")}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      /straipsniai/{String(record['slug'] ?? "")} ·{" "}
                      {String(record['published_at'] ?? "").slice(0, 10)}
                    </p>
                  </div>
                  {!record['published'] ? (
                    <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                      Juodraštis
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
                        slug: String(record['slug'] ?? ""),
                        title: String(record['title'] ?? ""),
                        excerpt: String(record['excerpt'] ?? ""),
                        body: String(record['body'] ?? ""),
                        author: String(record['author'] ?? ""),
                        image_path: (record['image_path'] as string | null) ?? null,
                        image_alt: String(record['image_alt'] ?? ""),
                        seo_title: String(record['seo_title'] ?? ""),
                        seo_description: String(record['seo_description'] ?? ""),
                        published: Boolean(record['published']),
                        show_on_home: Boolean(record['show_on_home']),
                        published_at: String(record['published_at'] ?? "").slice(0, 10),
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
                      if (confirm("Ištrinti šį straipsnį?")) deleteMutation.mutate(id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {isOpen && draft ? (
                  <div className="border-t border-border/70 p-4">
                    <PostForm
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

function PostForm({
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    onChange({ ...draft, [key]: value });

  const onFile = async (file: File) => {
    setBusy(true);
    try {
      const uploaded = await uploadOptimizedToStorage(file, "posts");
      const previous = draft.image_path;
      onChange({ ...draft, image_path: uploaded.path });
      if (previous && previous !== uploaded.path) {
        // Never leave orphaned objects behind in storage.
        await removeFromStorage(
          `/storage/v1/object/public/site-images/${previous}`,
        ).catch(() => undefined);
      }
      toast.success("Nuotrauka įkelta.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nepavyko įkelti.");
    } finally {
      setBusy(false);
    }
  };

  const cover = draft.image_path
    ? `${SUPABASE_URL}/storage/v1/object/public/site-images/${draft.image_path}`
    : null;

  return (
    <div className="space-y-5 rounded-xl border border-border/70 p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Pavadinimas</Label>
          <Input
            value={draft.title}
            onChange={(e) => {
              const title = e.target.value;
              onChange({
                ...draft,
                title,
                slug: draft.id ? draft.slug : slugify(title),
              });
            }}
          />
        </div>
        <div className="space-y-2">
          <Label>Adresas (slug)</Label>
          <Input value={draft.slug} onChange={(e) => set("slug", slugify(e.target.value))} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Trumpas aprašymas</Label>
        <Textarea rows={2} value={draft.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Tekstas (kiekviena pastraipa — nauja eilutė)</Label>
        <Textarea rows={12} value={draft.body} onChange={(e) => set("body", e.target.value)} />
      </div>

      <div className="space-y-3">
        <Label>Viršelio nuotrauka</Label>
        {cover ? (
          <img
            src={cover}
            alt={draft.image_alt || draft.title}
            className="h-40 w-full rounded-lg object-cover"
          />
        ) : (
          <p className="text-sm text-muted-foreground">Nuotraukos nėra.</p>
        )}
        <div className="flex flex-wrap gap-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onFile(file);
              e.target.value = "";
            }}
          />
          <Button variant="outline" disabled={busy} onClick={() => inputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" /> {busy ? "Keliama…" : "Įkelti nuotrauką"}
          </Button>
          {draft.image_path ? (
            <Button variant="ghost" onClick={() => set("image_path", null)}>
              Pašalinti
            </Button>
          ) : null}
        </div>
        <Input
          value={draft.image_alt}
          onChange={(e) => set("image_alt", e.target.value)}
          placeholder="Nuotraukos aprašymas (alt)"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>SEO antraštė (nebūtina)</Label>
          <Input value={draft.seo_title} onChange={(e) => set("seo_title", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>SEO aprašymas (nebūtina)</Label>
          <Input
            value={draft.seo_description}
            onChange={(e) => set("seo_description", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Autorius</Label>
          <Input value={draft.author} onChange={(e) => set("author", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Data</Label>
          <Input
            type="date"
            value={draft.published_at}
            onChange={(e) => set("published_at", e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex items-center justify-between rounded-lg border border-border/70 px-4 py-3">
          <Label className="text-sm font-normal">Publikuota svetainėje</Label>
          <Switch checked={draft.published} onCheckedChange={(v) => set("published", v)} />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border/70 px-4 py-3">
          <Label className="text-sm font-normal">Rodyti pradžios puslapyje</Label>
          <Switch checked={draft.show_on_home} onCheckedChange={(v) => set("show_on_home", v)} />
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={onSave} disabled={saving || busy}>
          {saving ? "Saugoma…" : "Išsaugoti"}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Atšaukti
        </Button>
        {draft.image_path ? (
          <span className="self-center text-xs text-muted-foreground">
            {publicUrl(draft.image_path) ? "Nuotrauka optimizuota (WebP)" : ""}
          </span>
        ) : null}
      </div>
    </div>
  );
}
