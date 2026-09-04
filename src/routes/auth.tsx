import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { requestPasswordReset } from "@/lib/auth-recovery.functions";
import { useServerFn } from "@tanstack/react-start";
import { PLATFORM_NAME } from "@/lib/brand";
import { LumaLogo } from "@/components/site/LumaLogo";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: `Prisijungimas | ${PLATFORM_NAME}` }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const sendReset = useServerFn(requestPasswordReset);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Already signed in with a staff role? Skip the form.
  useEffect(() => {
    let active = true;
    void (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active || !session) return;
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);
      if (active && (roles?.length ?? 0) > 0) navigate({ to: "/admin", replace: true });
    })();
    return () => {
      active = false;
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError || !data.session) {
      setError("Neteisingas el. paštas arba slaptažodis.");
      setLoading(false);
      return;
    }

    // Verify the account has a staff role; others are filtered out by RLS.
    const { data: roleRows, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.session.user.id);

    if (roleError || !roleRows || roleRows.length === 0) {
      await supabase.auth.signOut();
      setError("Ši paskyra neturi prieigos prie administravimo.");
      setLoading(false);
      return;
    }

    navigate({ to: "/admin", replace: true });
  };

  const handleForgotPassword = async () => {
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      setError("Pirmiausia įveskite el. pašto adresą.");
      return;
    }
    try {
      await sendReset({
        data: { email: email.trim(), redirectTo: `${window.location.origin}/reset-password` },
      });
    } catch {
      /* Do not reveal whether the address exists. */
    }
    setNotice("Jei tokia paskyra egzistuoja, slaptažodžio nustatymo nuoroda jau pakeliui.");
  };

  return (
    <div className="luma">
    <main className="auth-split">
      <div className="auth-formside">
        <div className="auth-inner">
          <div className="auth-mobile-logo">
            <LumaLogo />
          </div>

          <p className="auth-eyebrow">Administravimas</p>
          <h1 className="auth-title">Prisijungimas</h1>
          <p className="auth-sub">Prieiga tik pakviestiems vartotojams.</p>

          <div className="auth-card">
            <form onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="email">El. paštas</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="auth-field">
                <label htmlFor="password">Slaptažodis</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <p className="auth-error" role="alert">
                  {error}
                </p>
              )}
              {notice && <p className="auth-notice">{notice}</p>}

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? "Jungiamasi…" : "Prisijungti"}
              </button>
            </form>

            <button type="button" className="auth-alt" onClick={handleForgotPassword}>
              Pamiršai slaptažodį?
            </button>
          </div>

          <Link to="/" className="auth-home">
            ← Į pradžią
          </Link>
        </div>
      </div>

      <aside className="auth-brandside">
        <div className="auth-brand-logo">
          <LumaLogo />
        </div>
        <div className="auth-brand-rule" />
        <p className="auth-brand-note">Tik įgaliotiems asmenims</p>
      </aside>
    </main>
    </div>
  );
}
