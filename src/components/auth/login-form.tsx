"use client";

import { useMemo, useState } from "react";
import { Eye, EyeOff, LoaderCircle, LogIn } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const reasonMessages: Record<string, string> = {
  signed_out: "Entre com sua conta administrativa para acessar o Command Center.",
  misconfigured:
    "O painel esta sem configuracao administrativa completa no Supabase.",
  unauthorized:
    "Sua conta nao esta cadastrada em ops_admin_profiles. Solicite liberacao a um owner.",
};

export function LoginForm({
  reason,
}: {
  reason?: string;
}) {
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
          : "Nao foi possivel iniciar a sessao administrativa.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-white" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm text-white outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(0,95,115,0.24)]"
          placeholder="owner@codetrail.app"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-white" htmlFor="password">
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
            className="w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3 pr-12 text-sm text-white outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(0,95,115,0.24)]"
            placeholder="Sua senha administrativa"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute inset-y-0 right-3 inline-flex items-center text-[var(--text-secondary)] hover:text-white"
            aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[rgba(255,126,139,0.24)] bg-[rgba(255,126,139,0.08)] px-4 py-3 text-sm text-[#ffd5da]">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#005F73,#2EC5FF)] px-5 py-3 text-sm font-semibold text-[#04080B] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? <LoaderCircle className="animate-spin" size={18} /> : <LogIn size={18} />}
        Entrar no Command Center
      </button>
    </form>
  );
}
