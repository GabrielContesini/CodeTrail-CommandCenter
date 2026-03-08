import { AdminMembersWorkspace } from "@/components/forms/admin-members-workspace";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { getAdminAccess } from "@/lib/auth";
import { getAdminConsoleSnapshot } from "@/lib/admin-data";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [access, snapshot] = await Promise.all([
    getAdminAccess(),
    getAdminConsoleSnapshot(),
  ]);

  const adminRole = access?.profile?.role ?? "viewer";
  const ownerCount = snapshot.members.filter((member) => member.role === "owner").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administracao"
        title="Governanca do Command Center"
        description="Controle quem acessa o painel, quais papeis existem e acompanhe as ultimas mudancas administrativas feitas no ambiente."
        meta={[
          { label: "membros", value: String(snapshot.members.length) },
          { label: "owners", value: String(ownerCount) },
          { label: "gerado em", value: formatDateTime(snapshot.generatedAt) },
          { label: "seu papel", value: adminRole },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-4">
        <SectionCard
          title="Acesso publico"
          subtitle="Estado do login administrativo via Supabase."
        >
          <p className="text-sm text-[var(--text-secondary)]">
            {snapshot.hasSupabase
              ? "NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY configurados."
              : "Ambiente publico do Supabase ausente."}
          </p>
        </SectionCard>

        <SectionCard
          title="Chave administrativa"
          subtitle="Necessaria para leitura completa e alteracoes operacionais."
        >
          <p className="text-sm text-[var(--text-secondary)]">
            {snapshot.hasServiceRole
              ? "SUPABASE_SERVICE_ROLE_KEY ativa no ambiente do painel."
              : "SUPABASE_SERVICE_ROLE_KEY ainda nao configurada."}
          </p>
        </SectionCard>

        <SectionCard
          title="Fonte do produto"
          subtitle="Conexao de leitura com o banco do CodeTrail App."
        >
          <p className="text-sm text-[var(--text-secondary)]">
            {snapshot.hasProductSource
              ? "Fonte do produto configurada para puxar usuarios, sessoes e fila de sync."
              : "PRODUCT_SUPABASE_URL e PRODUCT_SUPABASE_SERVICE_ROLE_KEY ainda nao configurados."}
          </p>
        </SectionCard>

        <SectionCard
          title="Telemetria"
          subtitle="Token usado para ingest de heartbeats externos."
        >
          <p className="text-sm text-[var(--text-secondary)]">
            {snapshot.hasTelemetryToken
              ? "TELEMETRY_INGEST_TOKEN configurado para agentes externos."
              : "TELEMETRY_INGEST_TOKEN ainda nao configurado."}
          </p>
        </SectionCard>
      </div>

      <SectionCard
        title="Console administrativo"
        subtitle="Membros, papeis, concessao de acesso e trilha de auditoria do painel."
      >
        <AdminMembersWorkspace
          members={snapshot.members}
          audit={snapshot.audit}
          currentUserId={access?.user.id ?? ""}
          currentRole={adminRole}
        />
      </SectionCard>
    </div>
  );
}
