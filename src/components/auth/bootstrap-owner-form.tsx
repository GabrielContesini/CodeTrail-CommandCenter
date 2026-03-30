"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LoaderCircle, ShieldCheck } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

/* ─── shared field style ─────────────────────────────────────────────────── */
const inputCls =
  "input-dark w-full rounded-xl px-4 py-3 text-sm";

export function BootstrapOwnerForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/bootstrap/owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, email, password }),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        message?: string;
        email?: string;
      };

      if (!response.ok || !result.ok || !result.email) {
        throw new Error(result.message ?? "Falha ao criar o primeiro owner.");
      }

      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: result.email,
        password,
      });

      if (signInError) throw signInError;

      router.replace("/");
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Falha ao bootstrapar o primeiro owner.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {/* Info banner */}
      <div className="rounded-xl border border-[var(--status-green-border)] bg-[var(--status-green-bg)] px-4 py-3 text-sm text-[var(--status-green)]">
        Nenhum owner foi encontrado. Cadastre agora a primeira conta
        administrativa do Command Center.
      </div>

      {/* Nome */}
      <div className="space-y-2">
        <label
          className="text-sm font-medium text-[var(--text-secondary)]"
          htmlFor="bootstrap-display-name"
        >
          Nome
        </label>
        <input
          id="bootstrap-display-name"
          type="text"
          autoComplete="name"
          required
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          className={inputCls}
          placeholder="Gabriel Contesini"
        />
      </div>

      {/* E-mail */}
      <div className="space-y-2">
        <label
          className="text-sm font-medium text-[var(--text-secondary)]"
          htmlFor="bootstrap-email"
        >
          E-mail
        </label>
        <input
          id="bootstrap-email"
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
        <label
          className="text-sm font-medium text-[var(--text-secondary)]"
          htmlFor="bootstrap-password"
        >
          Senha
        </label>
        <div className="relative">
          <input
            id="bootstrap-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={`${inputCls} pr-12`}
            placeholder="Crie uma senha forte"
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
        {loading ? <LoaderCircle className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
        Criar primeiro owner
      </button>
    </form>
  );
}
