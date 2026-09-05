import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Copy, Send, ShieldCheck, Trash2, UserPlus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteUser, inviteUser, listUsersWithRoles, setUserRole } from "@/lib/users.functions";
import { getMyRole } from "@/lib/roles.functions";
import { MANAGED_ROLES, ROLE_LABEL, type AdminRole } from "@/lib/roles";
import { PLATFORM_NAME } from "@/lib/brand";
import { useBrandedTitle } from "@/hooks/useBrandedTitle";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: UsersPage,
  head: () => ({
    meta: [
      { title: `Vartotojai | ${PLATFORM_NAME}` },
      { name: "description", content: "Valdymo skydelio vartotojai ir jų teisės." },
      { property: "og:title", content: `Vartotojai | ${PLATFORM_NAME}` },
      { property: "og:description", content: "Valdymo skydelio vartotojai ir jų teisės." },
    ],
  }),
});

function fmt(value: string | null | undefined, withTime = false) {
  if (!value) return "—";
  const d = new Date(value);
  return withTime ? d.toLocaleString("lt-LT", { hour12: false }) : d.toLocaleDateString("lt-LT");
}

function RoleBadge({ role }: { role: AdminRole }) {
  return (
    <Badge variant="outline" className="gap-1">
      <ShieldCheck className="h-3 w-3" /> {ROLE_LABEL[role]}
    </Badge>
  );
}

function UsersPage() {
  useBrandedTitle("Vartotojai");
  const qc = useQueryClient();
  const fetchUsers = useServerFn(listUsersWithRoles);
  const fetchMe = useServerFn(getMyRole);
  const invite = useServerFn(inviteUser);
  const changeRole = useServerFn(setUserRole);
  const removeUser = useServerFn(deleteUser);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"owner" | "editor">("editor");
  const [result, setResult] = useState<
    { email: string; actionLink: string | null; emailed: boolean; reinvited: boolean } | null
  >(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const { data: me } = useQuery({ queryKey: ["my-role"], queryFn: () => fetchMe() });
  const { data: users, isLoading } = useQuery({
    queryKey: ["users-with-roles"],
    queryFn: () => fetchUsers(),
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["users-with-roles"] });

  const copyLink = (value: string) => {
    void navigator.clipboard.writeText(value);
    toast.success("Nuoroda nukopijuota.");
  };

  const inviteM = useMutation({
    mutationFn: (vars: { email: string; role: "owner" | "editor"; fullName?: string }) =>
      invite({
        data: {
          email: vars.email,
          role: vars.role,
          ...(vars.fullName ? { fullName: vars.fullName } : {}),
          ...(typeof window !== "undefined"
            ? { redirectTo: `${window.location.origin}/reset-password` }
            : {}),
        },
      }),
    onSuccess: (data, vars) => {
      setResult({
        email: vars.email,
        actionLink: data.actionLink,
        emailed: data.emailed,
        reinvited: data.reinvited,
      });
      toast.success(
        data.emailed
          ? data.reinvited
            ? "Pakvietimas išsiųstas iš naujo."
            : "Kvietimas išsiųstas."
          : "Nuoroda sugeneruota — persiųskite ją rankiniu būdu.",
      );
      setEmail("");
      setFullName("");
      setResendingId(null);
      refresh();
    },
    onError: (e) => {
      setResendingId(null);
      toast.error(e instanceof Error ? e.message : "Nepavyko pakviesti.");
    },
  });

  /** Re-issues the link for an account that exists but never signed in. */
  const resendInvite = (user: { userId: string; email: string; role: AdminRole }) => {
    const targetRole = user.role === "owner" ? "owner" : "editor";
    setResendingId(user.userId);
    inviteM.mutate({ email: user.email, role: targetRole });
  };


  const roleM = useMutation({
    mutationFn: (vars: { userId: string; role: "owner" | "editor" }) => changeRole({ data: vars }),
    onSuccess: () => {
      toast.success("Teisės atnaujintos.");
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Nepavyko atnaujinti."),
  });

  const deleteM = useMutation({
    mutationFn: (userId: string) => removeUser({ data: { userId } }),
    onSuccess: () => {
      toast.success("Paskyra ištrinta.");
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Nepavyko ištrinti."),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Vartotojai</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Teisių hierarchija: Developer → Savininkas → Redaktorius.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pakviesti vartotoją</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              if (email.trim())
                inviteM.mutate({
                  email: email.trim(),
                  role,
                  ...(fullName.trim() ? { fullName: fullName.trim() } : {}),
                });
            }}

          >
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="invite-email">El. paštas</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vardas@pastas.lt"
                required
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="invite-name">Vardas</Label>
              <Input
                id="invite-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Neprivaloma"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-role">Teisės</Label>
              <Select value={role} onValueChange={(v) => setRole(v as "owner" | "editor")}>
                <SelectTrigger id="invite-role" className="h-9 w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MANAGED_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={inviteM.isPending}>
              <UserPlus className="mr-2 h-4 w-4" />
              Pakviesti
            </Button>
          </form>

          {result && (
            <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4 text-sm">
              <p className="font-medium">
                {result.reinvited
                  ? `${result.email} jau turi paskyrą — sugeneruota nauja slaptažodžio nustatymo nuoroda. Teisės nepakeistos.`
                  : result.emailed
                    ? `Kvietimo laiškas išsiųstas į ${result.email}.`
                    : `Paskyra sukurta (${result.email}). Laiško išsiųsti nepavyko — perduokite nuorodą patys.`}
              </p>
              {result.actionLink && (
                <div className="mt-3 flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate rounded-md bg-background px-3 py-2 text-xs">
                    {result.actionLink}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyLink(result.actionLink!)}
                  >
                    <Copy className="mr-2 h-3.5 w-3.5" /> Kopijuoti
                  </Button>
                </div>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                Nuoroda rodoma vieną kartą. Vėliau ją galima sugeneruoti iš naujo.
              </p>
            </div>
          )}

        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Paskyros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Kraunama…</p>
          ) : (users ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Vartotojų nėra.</p>
          ) : (
            (users ?? []).map((u) => {
              const isDeveloper = u.role === "developer";
              const isSelf = u.email === me?.email;
              return (
                <div
                  key={u.userId}
                  className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-medium">{u.fullName || u.email}</span>
                      <RoleBadge role={u.role} />
                      {isSelf ? (
                        <Badge variant="outline" className="gap-1">
                          <ShieldCheck className="h-3 w-3" /> Jūs
                        </Badge>
                      ) : null}
                      {!u.confirmed && !isSelf ? (
                        <Badge variant="outline">Pakviesta</Badge>
                      ) : null}

                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">{u.email}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Sukurta {fmt(u.createdAt)} · Paskutinis prisijungimas{" "}
                      {fmt(u.lastSignInAt, true)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {isDeveloper ? (
                      <span className="text-xs text-muted-foreground">Apsaugota paskyra</span>
                    ) : (
                      <>
                        <Select
                          value={u.role}
                          onValueChange={(v) =>
                            roleM.mutate({ userId: u.userId, role: v as "owner" | "editor" })
                          }
                        >
                          <SelectTrigger className="w-[160px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {MANAGED_ROLES.map((r) => (
                              <SelectItem key={r} value={r}>
                                {ROLE_LABEL[r]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {!isSelf && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label="Ištrinti">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Ištrinti paskyrą?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {u.email} praras prieigą. Veiksmo atšaukti negalima.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Atšaukti</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteM.mutate(u.userId)}>
                                  Ištrinti
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
