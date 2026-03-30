"use client";

import { useMemo, useState } from "react";
import { Eye, EyeOff, LoaderCircle, LogIn } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const reasonMessages: Record<string, string> = {
  signed_out: "Entre com sua conta administrativa para acessar o Command Center.",
  misconfigured:
    "O painel está sem configuração administrativa completa no Supabase.",
  unauthorized:
    "Sua conta não está cadastrada em ops_admin_profiles. Solicite liberação a um owner.",
};

/* ─── shared field style ─────────────────────────────────────────────────── */
const inputCls =
  "input-dark w-full rounded-xl px-4 py-3 text-sm";

export function LoginForm({ reason }: { reason?: string }) {
  const initialMessage = useMemo(
    () => (reason ? reasonMessages[reason] ?? null : null),
    [reason],
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(initialMessage);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      window.location.assign("/");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível iniciar a sessão administrativa.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {/* E-mail */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text-secondary)]" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputCls}
          placeholder="owner@codetrail.app"
        />
      </div>

      {/* Senha */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text-secondary)]" htmlFor="password">
          Senha
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={`${inputCls} pr-12`}
            placeholder="Sua senha administrativa"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute inset-y-0 right-3 inline-flex items-center text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors"
            aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error ? (
        <div className="rounded-xl border border-[var(--status-red-border)] bg-[var(--status-red-bg)] px-4 py-3 text-sm text-[var(--status-red)]">
          {error}
        </div>
      ) : null}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full !rounded-xl disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? <LoaderCircle className="animate-spin" size={18} /> : <LogIn size={18} />}
        Entrar no Command Center
      </button>
    </form>
  );
}
