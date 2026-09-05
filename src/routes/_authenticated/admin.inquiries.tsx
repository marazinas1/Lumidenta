import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Archive, ArchiveRestore, Mail, MailOpen, Phone, Search } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  useInquiries,
  useUpdateInquiry,
  type Inquiry,
  type InquiryFilter,
} from "@/hooks/admin/useInquiries";
import { useBrandedTitle } from "@/hooks/useBrandedTitle";

export const Route = createFileRoute("/_authenticated/admin/inquiries")({
  component: InquiriesPage,
});

const formatDate = (value: string) =>
  new Date(value).toLocaleString("lt-LT", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

function InquiryDetail({
  inquiry,
  onClose,
  onToggleRead,
  onToggleArchive,
}: {
  inquiry: Inquiry | null;
  onClose: () => void;
  onToggleRead: (i: Inquiry) => void;
  onToggleArchive: (i: Inquiry) => void;
}) {
  return (
    <Sheet open={Boolean(inquiry)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {inquiry && (
          <>
            <SheetHeader className="text-left">
              <SheetTitle className="text-xl">{inquiry.name}</SheetTitle>
              <p className="text-xs text-muted-foreground">{formatDate(inquiry.created_at)}</p>
            </SheetHeader>

            <div className="mt-6 space-y-4">
              <div className="flex flex-col gap-2">
                <a
                  href={`mailto:${inquiry.email}?subject=${encodeURIComponent("Atsakymas į Jūsų užklausą")}`}
                  className="inline-flex items-center gap-2 text-sm underline underline-offset-4"
                >
                  <Mail className="h-4 w-4" />
                  {inquiry.email}
                </a>
                {inquiry.phone && (
                  <a
                    href={`tel:${inquiry.phone.replace(/[^0-9+]/g, "")}`}
                    className="inline-flex items-center gap-2 text-sm underline underline-offset-4"
                  >
                    <Phone className="h-4 w-4" />
                    {inquiry.phone}
                  </a>
                )}
              </div>

              {inquiry.message && (
                <div className="rounded-xl border bg-muted/40 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{inquiry.message}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => onToggleRead(inquiry)}>
                  <MailOpen className="mr-2 h-4 w-4" />
                  {inquiry.read_at ? "Žymėti kaip neskaitytą" : "Žymėti kaip skaitytą"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => onToggleArchive(inquiry)}>
                  {inquiry.archived_at ? (
                    <>
                      <ArchiveRestore className="mr-2 h-4 w-4" />
                      Grąžinti
                    </>
                  ) : (
                    <>
                      <Archive className="mr-2 h-4 w-4" />
                      Archyvuoti
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function InquiriesPage() {
  useBrandedTitle("Užklausos");
  const [filter, setFilter] = useState<InquiryFilter>("all");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const { data: inquiries, isLoading } = useInquiries(filter, search);
  const update = useUpdateInquiry();

  const selected = useMemo(
    () => inquiries?.find((i) => i.id === openId) ?? null,
    [inquiries, openId],
  );

  // Opening an inquiry marks it read.
  useEffect(() => {
    if (selected && !selected.read_at) {
      update.mutate({ id: selected.id, patch: { read_at: new Date().toISOString() } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  const toggleRead = (inquiry: Inquiry) =>
    update.mutate({
      id: inquiry.id,
      patch: { read_at: inquiry.read_at ? null : new Date().toISOString() },
    });

  const toggleArchive = (inquiry: Inquiry) => {
    const archiving = !inquiry.archived_at;
    update.mutate(
      { id: inquiry.id, patch: { archived_at: archiving ? new Date().toISOString() : null } },
      {
        onSuccess: () => {
          setOpenId(null);
          toast.success(
            archiving
              ? "Užklausa archyvuota — nieko neištrinta, ją rasite skiltyje „Archyvuotos“."
              : "Užklausa grąžinta į sąrašą.",
          );
        },
      },
    );
  };

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-semibold">Užklausos</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Visos žinutės, atsiųstos per svetainės kontaktų formą. Archyvavimas užklausą tik paslepia —
        ji niekada neištrinama.
      </p>

      <div className="mb-5 mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ieškoti pagal vardą ar el. paštą"
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as InquiryFilter)}>
          <SelectTrigger className="sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Visos</SelectItem>
            <SelectItem value="unread">Neskaitytos</SelectItem>
            <SelectItem value="archived">Archyvuotos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Kraunama…</p>
      ) : !inquiries || inquiries.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            {filter === "archived" ? "Archyve tuščia." : "Užklausų kol kas nėra."}
          </p>
        </div>
      ) : (
        <div className="divide-y overflow-hidden rounded-xl border bg-card">
          {inquiries.map((inquiry) => {
            const unread = !inquiry.read_at;
            return (
              <button
                key={inquiry.id}
                type="button"
                onClick={() => setOpenId(inquiry.id)}
                className={`w-full px-4 py-4 text-left transition-colors hover:bg-muted/50 ${unread ? "bg-muted/30" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className={`mt-2 h-2 w-2 shrink-0 rounded-full ${unread ? "bg-foreground" : "bg-transparent"}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`truncate ${unread ? "font-semibold" : ""}`}>
                        {inquiry.name}
                      </span>
                      {unread && <Badge variant="secondary">Nauja</Badge>}
                      {inquiry.archived_at && <Badge variant="outline">Archyvuota</Badge>}
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {inquiry.email}
                      {inquiry.phone ? ` · ${inquiry.phone}` : ""}
                    </p>
                    {inquiry.message && (
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {inquiry.message}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">
                    {formatDate(inquiry.created_at)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <InquiryDetail
        inquiry={selected}
        onClose={() => setOpenId(null)}
        onToggleRead={toggleRead}
        onToggleArchive={toggleArchive}
      />
    </div>
  );
}
