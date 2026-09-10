import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { PageTextField } from "@/components/admin/PageTextField";
import { ReadOnlyNotice, useCanEdit } from "@/components/admin/ReadOnlyNotice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CATALOG_KEY } from "@/lib/catalog";
import {
  deletePriceGroup,
  deletePriceItem,
  listPriceList,
  savePriceGroup,
  savePriceItem,
} from "@/lib/catalog-admin.functions";
import { pageContentQuery } from "@/lib/page-content";
import { emptyPageContent } from "@/lib/page-content.functions";

export const Route = createFileRoute("/_authenticated/admin/website/prices")({
  component: PricesEditor,
});

const PAGE = "prices";
const LIST_KEY = ["admin-price-list"] as const;

type Field = { slot: string; label: string; fallback: string; multiline?: boolean };

const FIELDS: Field[] = [
  { slot: "hero_eyebrow", label: "Viršutinė eilutė", fallback: "Kainoraštis" },
  { slot: "hero_heading", label: "Antraštė", fallback: "Aiškios kainos, be netikėtumų." },
  {
    slot: "hero_lead",
    label: "Įžanga",
    fallback:
      "Žemiau — dažniausių procedūrų kainos. Tikslų planą ir galutinę kainą aptariame vizito metu, prieš pradedant gydymą.",
    multiline: true,
  },
  {
    slot: "footer_note",
    label: "Pastaba po kainoraščiu",
    fallback:
      "Kainos yra orientacinės. Galutinė kaina priklauso nuo dantų būklės ir pasirinktų medžiagų — ji visada patvirtinama po apžiūros, prieš gydymą.",
    multiline: true,
  },
  { slot: "cta_button", label: "Mygtukas", fallback: "Susisiekti dėl vizito →" },
];

type GroupRow = {
  id: string;
  title: string;
  note: string;
  sort_order: number;
  published: boolean;
};

type ItemRow = {
  id: string;
  group_id: string;
  title: string;
  note: string;
  price_text: string;
  sort_order: number;
  published: boolean;
};

function PricesEditor() {
  const { canEdit } = useCanEdit();
  const queryClient = useQueryClient();

  const fetchList = useServerFn(listPriceList);
  const saveGroup = useServerFn(savePriceGroup);
  const removeGroup = useServerFn(deletePriceGroup);
  const saveItem = useServerFn(savePriceItem);
  const removeItem = useServerFn(deletePriceItem);

  const { data, isLoading } = useQuery({ queryKey: LIST_KEY, queryFn: () => fetchList({}) });
  const { data: content } = useQuery(pageContentQuery);
  const text = content ?? emptyPageContent;
  const valueOf = (slot: string) => text.text[`${PAGE}:${slot}:lt`] ?? "";

  const groups = (data?.groups ?? []) as GroupRow[];
  const items = (data?.items ?? []) as ItemRow[];

  const [newGroup, setNewGroup] = useState("");

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: LIST_KEY });
    await queryClient.invalidateQueries({ queryKey: CATALOG_KEY });
  };

  const groupMutation = useMutation({
    mutationFn: (value: Partial<GroupRow> & { title: string }) =>
      saveGroup({
        data: {
          ...(value.id ? { id: value.id } : {}),
          title: value.title,
          note: value.note ?? "",
          sort_order: value.sort_order ?? groups.length * 10 + 10,
          published: value.published ?? true,
        },
      }),
    onSuccess: async () => {
      toast.success("Išsaugota.");
      setNewGroup("");
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const groupDelete = useMutation({
    mutationFn: (id: string) => removeGroup({ data: { id } }),
    onSuccess: async () => {
      toast.success("Grupė ištrinta.");
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const itemMutation = useMutation({
    mutationFn: (value: Partial<ItemRow> & { group_id: string; title: string }) =>
      saveItem({
        data: {
          ...(value.id ? { id: value.id } : {}),
          group_id: value.group_id,
          title: value.title,
          note: value.note ?? "",
          price_text: value.price_text ?? "",
          sort_order: value.sort_order ?? 0,
          published: value.published ?? true,
        },
      }),
    onSuccess: async () => {
      toast.success("Išsaugota.");
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const itemDelete = useMutation({
    mutationFn: (id: string) => removeItem({ data: { id } }),
    onSuccess: async () => {
      toast.success("Eilutė ištrinta.");
      await refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <fieldset disabled={!canEdit} className="block space-y-8">
      <ReadOnlyNotice canEdit={canEdit} />
      <div>
        <h1 className="text-2xl font-semibold">Kainoraštis</h1>
        <p className="mt-2 max-w-prose text-sm text-muted-foreground">
          Kainoraštis rodomas puslapyje „Kainos“. Suskirstykite procedūras į grupes (pvz.
          „Konsultacijos ir diagnostika“) ir kiekvienoje surašykite eilutes su kainomis.
        </p>
      </div>

      <section className="space-y-4 rounded-xl border border-border/70 p-5">
        <h2 className="text-lg font-medium">Puslapio tekstai</h2>
        <div className="grid gap-4">
          {FIELDS.map((field) => (
            <PageTextField
              key={field.slot}
              page={PAGE}
              slot={field.slot}
              label={field.label}
              fallback={field.fallback}
              value={valueOf(field.slot)}
              multiline={field.multiline ?? false}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex min-w-[240px] flex-1 flex-col gap-1.5">
            <Label className="text-sm">Nauja grupė</Label>
            <Input
              value={newGroup}
              onChange={(event) => setNewGroup(event.target.value)}
              placeholder="pvz. Konsultacijos ir diagnostika"
            />
          </div>
          <Button
            onClick={() => newGroup.trim() && groupMutation.mutate({ title: newGroup.trim() })}
            disabled={!newGroup.trim() || groupMutation.isPending}
          >
            <Plus className="mr-2 h-4 w-4" /> Pridėti grupę
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Kraunama…</p>
        ) : groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">Kol kas nėra nė vienos grupės.</p>
        ) : (
          groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              items={items.filter((item) => item.group_id === group.id)}
              onSaveGroup={(value) => groupMutation.mutate(value)}
              onDeleteGroup={() => {
                if (confirm(`Ištrinti grupę „${group.title}“ su visomis eilutėmis?`)) {
                  groupDelete.mutate(group.id);
                }
              }}
              onSaveItem={(value) => itemMutation.mutate(value)}
              onDeleteItem={(id) => itemDelete.mutate(id)}
            />
          ))
        )}
      </section>
    </fieldset>
  );
}

function GroupCard({
  group,
  items,
  onSaveGroup,
  onDeleteGroup,
  onSaveItem,
  onDeleteItem,
}: {
  group: GroupRow;
  items: ItemRow[];
  onSaveGroup: (value: Partial<GroupRow> & { title: string }) => void;
  onDeleteGroup: () => void;
  onSaveItem: (value: Partial<ItemRow> & { group_id: string; title: string }) => void;
  onDeleteItem: (id: string) => void;
}) {
  const [draft, setDraft] = useState(group);
  const [item, setItem] = useState({ title: "", note: "", price_text: "" });

  return (
    <div className="space-y-4 rounded-xl border border-border/70 p-5">
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto_auto] md:items-end">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm">Grupės pavadinimas</Label>
          <Input
            value={draft.title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm">Paaiškinimas (nebūtina)</Label>
          <Input
            value={draft.note}
            onChange={(event) => setDraft({ ...draft, note: event.target.value })}
          />
        </div>
        <div className="flex w-24 flex-col gap-1.5">
          <Label className="text-sm">Eilė</Label>
          <Input
            type="number"
            value={draft.sort_order}
            onChange={(event) => setDraft({ ...draft, sort_order: Number(event.target.value) })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm">Rodoma</Label>
          <Switch
            checked={draft.published}
            onCheckedChange={(checked) => setDraft({ ...draft, published: checked })}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => onSaveGroup(draft)}>
            Išsaugoti
          </Button>
          <Button variant="ghost" onClick={onDeleteGroup} aria-label="Ištrinti grupę">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((row) => (
          <ItemRowForm
            key={row.id}
            row={row}
            onSave={onSaveItem}
            onDelete={() => onDeleteItem(row.id)}
          />
        ))}
      </div>

      <div className="grid gap-3 rounded-lg bg-muted/40 p-3 md:grid-cols-[1fr_1fr_160px_auto] md:items-end">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm">Nauja eilutė</Label>
          <Input
            value={item.title}
            onChange={(event) => setItem({ ...item, title: event.target.value })}
            placeholder="pvz. Pirminė konsultacija"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm">Paaiškinimas</Label>
          <Input
            value={item.note}
            onChange={(event) => setItem({ ...item, note: event.target.value })}
            placeholder="nebūtina"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm">Kaina</Label>
          <Input
            value={item.price_text}
            onChange={(event) => setItem({ ...item, price_text: event.target.value })}
            placeholder="pvz. nuo 60 €"
          />
        </div>
        <Button
          variant="secondary"
          disabled={!item.title.trim()}
          onClick={() => {
            onSaveItem({
              group_id: group.id,
              title: item.title.trim(),
              note: item.note,
              price_text: item.price_text,
              sort_order: items.length * 10 + 10,
              published: true,
            });
            setItem({ title: "", note: "", price_text: "" });
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Pridėti
        </Button>
      </div>
    </div>
  );
}

function ItemRowForm({
  row,
  onSave,
  onDelete,
}: {
  row: ItemRow;
  onSave: (value: Partial<ItemRow> & { group_id: string; title: string }) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(row);

  return (
    <div className="grid gap-3 rounded-lg border border-border/60 p-3 md:grid-cols-[1fr_1fr_150px_90px_auto_auto] md:items-end">
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm">Pavadinimas</Label>
        <Input
          value={draft.title}
          onChange={(event) => setDraft({ ...draft, title: event.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm">Paaiškinimas</Label>
        <Input
          value={draft.note}
          onChange={(event) => setDraft({ ...draft, note: event.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm">Kaina</Label>
        <Input
          value={draft.price_text}
          onChange={(event) => setDraft({ ...draft, price_text: event.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm">Eilė</Label>
        <Input
          type="number"
          value={draft.sort_order}
          onChange={(event) => setDraft({ ...draft, sort_order: Number(event.target.value) })}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm">Rodoma</Label>
        <Switch
          checked={draft.published}
          onCheckedChange={(checked) => setDraft({ ...draft, published: checked })}
        />
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => onSave(draft)}>
          Išsaugoti
        </Button>
        <Button variant="ghost" onClick={onDelete} aria-label="Ištrinti eilutę">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
