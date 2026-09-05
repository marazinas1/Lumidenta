import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Lock } from "lucide-react";

import { getMyRole } from "@/lib/roles.functions";

/**
 * Editors may look at everything in the admin panel but may not change content.
 * Only owner and developer can edit; only developer can set defaults.
 */
export function useCanEdit() {
  const fetchRole = useServerFn(getMyRole);
  const { data } = useQuery({ queryKey: ["my-role"], queryFn: () => fetchRole({}) });
  return {
    role: data?.role ?? null,
    canEdit: Boolean(data?.isOwner),
    isDeveloper: data?.role === "developer",
    loaded: Boolean(data),
  };
}

/** Calm banner shown to editors above every content screen. */
export function ReadOnlyNotice({ canEdit }: { canEdit: boolean }) {
  if (canEdit) return null;
  return (
    <div className="mb-5 flex items-start gap-2 rounded-xl border border-border/70 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
      <Lock className="mt-0.5 h-4 w-4 shrink-0" />
      <span>
        Peržiūros režimas — turinį keisti gali tik savininkas arba developeris.
      </span>
    </div>
  );
}
