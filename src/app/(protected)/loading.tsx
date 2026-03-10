import { PageHeader } from "@/components/ui/page-header";
import { Loader2 } from "lucide-react";

export default function ProtectedLoading() {
 return (
  <div className="space-y-6">
   <PageHeader
    eyebrow="Visao operacional"
    title="Command Center do ecossistema CodeTrail"
    description="Painel unico para acompanhar usuarios, fila de sincronizacao, saude dos apps e heartbeat do ambiente Windows."
    meta={[
     {
      label: "status",
      value: "conectando...",
     },
     {
      label: "atualizado",
      value: "agora",
     },
    ]}
   />

   <div className="flex flex-col items-center justify-center py-32 text-[var(--text-secondary)]">
    <Loader2 className="mb-4 h-10 w-10 animate-spin text-[var(--accent-secondary)]" />
    <p className="text-sm font-medium uppercase tracking-widest text-white/50 animate-pulse">
     Estabelecendo conexao com as fontes de dados...
    </p>
   </div>
  </div>
 );
}
