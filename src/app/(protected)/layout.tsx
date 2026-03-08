import { AppShell } from "@/components/shell/app-shell";
import { requireAdminAccess } from "@/lib/auth";
import { getCommandCenterSnapshot } from "@/lib/command-center-data";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const access = await requireAdminAccess();
  const snapshot = await getCommandCenterSnapshot();
  const admin = access?.profile
    ? {
        displayName: access.profile.displayName,
        email: access.user.email,
        role: access.profile.role,
      }
    : null;
  const sidebarSummary = {
    openIncidents: snapshot.incidents.filter(
      (incident) => incident.status !== "resolved",
    ).length,
    riskyUsers: snapshot.users.filter(
      (user) => user.riskLevel === "attention" || user.riskLevel === "critical",
    ).length,
    degradedSystems: snapshot.systems.filter((system) => system.status !== "up")
      .length,
    databaseAttention: snapshot.database.filter(
      (table) => table.health === "attention",
    ).length,
    pendingSync:
      snapshot.database.find((table) => table.tableName === "sync_queue")
        ?.rowCount ?? 0,
  };

  return (
    <AppShell admin={admin} sidebarSummary={sidebarSummary}>
      {children}
    </AppShell>
  );
}
