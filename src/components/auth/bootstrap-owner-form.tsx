"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LoaderCircle, ShieldCheck } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName,
          email,
          password,
        }),
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

      if (signInError) {
        throw signInError;
      }

      router.replace("/");
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Falha ao bootstrapar o primeiro owner.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="rounded-2xl border border-[rgba(53,211,154,0.24)] bg-[rgba(53,211,154,0.08)] px-4 py-3 text-sm text-[#d9fff2]">
        Nenhum owner foi encontrado. Cadastre agora a primeira conta
        administrativa do Command Center.
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-white" htmlFor="bootstrap-display-name">
          Nome
        </label>
        <input
          id="bootstrap-display-name"
          type="text"
          autoComplete="name"
          required
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm text-white outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(0,95,115,0.24)]"
          placeholder="Gabriel Contesini"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-white" htmlFor="bootstrap-email">
          E-mail
        </label>
        <input
          id="bootstrap-email"
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
        <label className="text-sm font-medium text-white" htmlFor="bootstrap-password">
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
            className="w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3 pr-12 text-sm text-white outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(0,95,115,0.24)]"
            placeholder="Crie uma senha forte"
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
        {loading ? (
          <LoaderCircle className="animate-spin" size={18} />
        ) : (
          <ShieldCheck size={18} />
        )}
        Criar primeiro owner
      </button>
    </form>
  );
}
