import { UserOpsWorkspace } from "@/components/forms/user-ops-workspace";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { getCommandCenterSnapshot } from "@/lib/command-center-data";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const snapshot = await getCommandCenterSnapshot();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Gestao de usuarios"
        title="Radar operacional por usuario"
        description="Cruza onboarding, uso recente, fila de sincronizacao e notas internas da operacao."
        meta={[
          { label: "usuarios", value: String(snapshot.users.length) },
          { label: "gerado em", value: formatDateTime(snapshot.generatedAt) },
        ]}
      />

      <SectionCard
        title="Workspace do operador"
        subtitle="Selecione um usuario, revise sinais de risco e atualize a watchlist interna."
      >
        <UserOpsWorkspace users={snapshot.users} />
      </SectionCard>
    </div>
  );
}
