import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { BootstrapOwnerForm } from "@/components/auth/bootstrap-owner-form";
import { LoginForm } from "@/components/auth/login-form";
import { countOwners } from "@/lib/admin-ops";
import { getAdminAccess } from "@/lib/auth";
import { getCommandCenterEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const access = await getAdminAccess();
  if (access?.profile) {
    redirect("/");
  }

  const env = getCommandCenterEnv();
  const { reason } = await searchParams;
  const admin = createSupabaseAdminClient();
  const ownerCount = admin ? await countOwners(admin).catch(() => 0) : 0;
  const needsBootstrap = env.hasAdmin && ownerCount === 0;

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-10 bg-[var(--bg-base)]">
      <div className="pointer-events-none fixed inset-0 subtle-grid opacity-10" />
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1380px] items-stretch gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="flex min-h-[420px] flex-col justify-between rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-surface-low)] p-8 sm:p-10">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-[var(--accent-light)] bg-[var(--accent-light)] px-4 py-2 text-xs uppercase tracking-[0.22em] font-bold text-[var(--accent)]">
              <ShieldCheck size={16} />
              acesso administrativo
            </div>
            <h1 className="mt-8 max-w-xl text-4xl font-black tracking-tight text-[var(--text-primary)] sm:text-5xl">
              Command Center do ecossistema CodeTrail
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--text-secondary)]">
              Entre com a conta administrativa do Command Center para operar
              usuários, incidentes, telemetria Windows e a saúde do ecossistema
              CodeTrail em um único painel.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-container)] p-4">
              <p className="label-caps">
                auth
              </p>
              <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                Supabase Auth + RBAC por ops_admin_profiles
              </p>
            </div>
            <div className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-container)] p-4">
              <p className="label-caps">
                dados
              </p>
              <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                Painel separado da base transacional do produto
              </p>
            </div>
            <div className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-surface-container)] p-4">
              <p className="label-caps">
                custo
              </p>
              <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                Arquitetura enxuta para operar no tier gratuito
              </p>
            </div>
          </div>
        </section>

        <section className="flex rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-surface-low)] p-8 sm:p-10">
          <div className="m-auto w-full max-w-md">
            <p className="label-cyan">
              sign in
            </p>
            <h2 className="mt-3 text-2xl font-black text-[var(--text-primary)]">
              {needsBootstrap ? "Primeiro acesso" : "Entrar como operador"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
              {needsBootstrap
                ? "Crie a primeira conta owner do Command Center. Depois disso, os demais acessos seguem o fluxo normal de login."
                : "Use uma conta criada no Supabase do Command Center e garanta que ela tenha um registro em "}
              {!needsBootstrap ? <code className="text-[var(--accent)] font-mono">ops_admin_profiles</code> : null}
              {!needsBootstrap ? "." : null}
            </p>

            {!env.hasSupabase ? (
              <div className="mt-6 rounded-xl border border-[var(--status-yellow-border)] bg-[var(--status-yellow-bg)] px-4 py-3 text-sm text-[var(--status-yellow)]">
                O painel está sem NEXT_PUBLIC_SUPABASE_URL e
                NEXT_PUBLIC_SUPABASE_ANON_KEY. Configure o ambiente para ativar o login.
              </div>
            ) : null}

            {env.hasSupabase && !env.hasAdmin ? (
              <div className="mt-6 rounded-xl border border-[var(--status-yellow-border)] bg-[var(--status-yellow-bg)] px-4 py-3 text-sm text-[var(--status-yellow)]">
                O painel está sem SUPABASE_SERVICE_ROLE_KEY. Configure essa chave
                para criar ou gerenciar administradores.
              </div>
            ) : null}

            <div className="mt-8">
              {needsBootstrap ? (
                <BootstrapOwnerForm />
              ) : (
                <LoginForm reason={reason} />
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
