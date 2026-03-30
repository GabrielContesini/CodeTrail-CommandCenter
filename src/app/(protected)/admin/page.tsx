import { AdminMembersWorkspace } from "@/components/forms/admin-members-workspace";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { GlassCard } from "@/components/ui/glass-card";
import { StatCard } from "@/components/ui/stat-card";
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
  const editorCount = snapshot.members.filter((member) => member.role === "editor").length;
  const viewerCount = snapshot.members.filter((member) => member.role === "viewer").length;
  const totalMembers = snapshot.members.length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administração"
        title="Governança do Command Center"
        description="Controle quem acessa o painel, quais papéis existem e acompanhe as últimas mudanças administrativas feitas no ambiente."
        meta={[
          { label: "membros", value: String(totalMembers) },
          { label: "owners", value: String(ownerCount) },
          { label: "gerado em", value: formatDateTime(snapshot.generatedAt) },
          { label: "seu papel", value: adminRole },
        ]}
      />

      {/* Access Status Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <GlassCard className="p-6">
          <StatCard
            label="Acesso Público"
            value={snapshot.hasSupabase ? "Ativo" : "Inativo"}
            delta={snapshot.hasSupabase ? "Supabase configurado" : "Não configurado"}
            deltaColor={snapshot.hasSupabase ? "emerald" : "rose"}
            progress={snapshot.hasSupabase ? 100 : 0}
          />
        </GlassCard>
        <GlassCard className="p-6">
          <StatCard
            label="Chave Administrativa"
            value={snapshot.hasServiceRole ? "Ativa" : "Inativa"}
            delta={snapshot.hasServiceRole ? "Service role ok" : "Pendente configuração"}
            deltaColor={snapshot.hasServiceRole ? "emerald" : "amber"}
            progress={snapshot.hasServiceRole ? 100 : 50}
          />
        </GlassCard>
        <GlassCard className="p-6">
          <StatCard
            label="Fonte do Produto"
            value={snapshot.hasProductSource ? "Conectada" : "Desconectada"}
            delta={snapshot.hasProductSource ? "Dados sincronizando" : "Sem dados"}
            deltaColor={snapshot.hasProductSource ? "emerald" : "rose"}
            progress={snapshot.hasProductSource ? 100 : 0}
          />
        </GlassCard>
        <GlassCard className="p-6">
          <StatCard
            label="Telemetria"
            value={snapshot.hasTelemetryToken ? "Habilitada" : "Desabilitada"}
            delta={snapshot.hasTelemetryToken ? "Agentes ativos" : "Sem agentes"}
            deltaColor={snapshot.hasTelemetryToken ? "cyan" : "amber"}
            progress={snapshot.hasTelemetryToken ? 100 : 0}
          />
        </GlassCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SectionCard
          title="Acesso público"
          subtitle="Estado do login administrativo via Supabase."
        >
          <p className="text-sm text-[var(--text-secondary)]">
            {snapshot.hasSupabase
              ? "NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY configurados."
              : "Ambiente público do Supabase ausente."}
          </p>
        </SectionCard>

        <SectionCard
          title="Chave administrativa"
          subtitle="Necessária para leitura completa e alterações operacionais."
        >
          <p className="text-sm text-[var(--text-secondary)]">
            {snapshot.hasServiceRole
              ? "SUPABASE_SERVICE_ROLE_KEY ativa no ambiente do painel."
              : "SUPABASE_SERVICE_ROLE_KEY ainda não configurada."}
          </p>
        </SectionCard>

        <SectionCard
          title="Fonte do produto"
          subtitle="Conexão de leitura com o banco do CodeTrail App."
        >
          <p className="text-sm text-[var(--text-secondary)]">
            {snapshot.hasProductSource
              ? "Fonte do produto configurada para puxar usuários, sessões e fila de sync."
              : "PRODUCT_SUPABASE_URL e PRODUCT_SUPABASE_SERVICE_ROLE_KEY ainda não configurados."}
          </p>
        </SectionCard>

        <SectionCard
          title="Telemetria"
          subtitle="Token usado para ingest de heartbeats externos."
        >
          <p className="text-sm text-[var(--text-secondary)]">
            {snapshot.hasTelemetryToken
              ? "TELEMETRY_INGEST_TOKEN configurado para agentes externos."
              : "TELEMETRY_INGEST_TOKEN ainda não configurado."}
          </p>
        </SectionCard>
      </div>

      {/* Members Distribution */}
      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard className="p-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Proprietários (Owners)</p>
            <p className="text-3xl font-bold text-[var(--accent)]">{ownerCount}</p>
            <p className="text-xs text-[var(--text-secondary)]">{((ownerCount / totalMembers) * 100).toFixed(0)}% do total</p>
          </div>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Editores</p>
            <p className="text-3xl font-bold text-[var(--accent)]">{editorCount}</p>
            <p className="text-xs text-[var(--text-secondary)]">{((editorCount / totalMembers) * 100).toFixed(0)}% do total</p>
          </div>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Visualizadores</p>
            <p className="text-3xl font-bold text-[var(--accent)]">{viewerCount}</p>
            <p className="text-xs text-[var(--text-secondary)]">{((viewerCount / totalMembers) * 100).toFixed(0)}% do total</p>
          </div>
        </GlassCard>
      </div>

      <SectionCard
        title="Console administrativo"
        subtitle="Membros, papéis, concessão de acesso e trilha de auditoria do painel."
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
