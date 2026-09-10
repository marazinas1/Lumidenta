import { Check, Lock, X } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { useCanEdit } from "@/components/admin/ReadOnlyNotice";
import { useDefaultRequests } from "@/lib/default-requests";
import { PAGE_CONTENT_KEY } from "@/lib/page-content";

/**
 * Developer-only queue: wording the owner asked to lock in as the default.
 * Approving writes the default and clears her override in one step.
 */
export function DefaultRequestQueue() {
  const { isDeveloper } = useCanEdit();
  const requests = useDefaultRequests();
  const qc = useQueryClient();

  if (!isDeveloper || requests.pending.length === 0) return null;

  async function decide(id: string, approve: boolean) {
    try {
      await requests.resolve.mutateAsync({ id, approve });
      await qc.invalidateQueries({ queryKey: PAGE_CONTENT_KEY });
      toast.success(approve ? "Tekstas užrakintas kaip numatytasis." : "Prašymas atmestas.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Nepavyko atlikti veiksmo");
    }
  }

  return (
    <section>
      <h2 className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        Prašymai dėl numatytųjų tekstų
      </h2>
      <div className="mt-4 space-y-3">
        {requests.pending.map((row) => (
          <div key={row.id} className="rounded-xl border bg-card p-4">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
              {row.page} → {row.slot} ({row.locale.toUpperCase()})
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm">{row.requested_text}</p>
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                size="sm"
                disabled={requests.resolve.isPending}
                onClick={() => void decide(row.id, true)}
              >
                <Check className="mr-1 h-3.5 w-3.5" />
                Patvirtinti
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={requests.resolve.isPending}
                onClick={() => void decide(row.id, false)}
              >
                <X className="mr-1 h-3.5 w-3.5" />
                Atmesti
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
