import { SupportConsole } from "@/components/chat/support-console";
import { canEditOps, requireAdminAccess } from "@/lib/auth";
import {
  getSupportThread,
  listSupportInbox,
  SupportChatDataError,
} from "@/lib/support-chat";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  const access = await requireAdminAccess();
  const profile = access.profile;

  if (!profile) {
    return null;
  }

  try {
    const inbox = await listSupportInbox(access, { limit: 50 });
    const initialConversationId = inbox.conversations[0]?.id ?? null;
    const initialThread = initialConversationId
      ? await getSupportThread(access, initialConversationId)
      : null;

    return (
      <div className="flex h-full min-h-0 w-full flex-col p-4 sm:p-5 xl:p-6">
        <SupportConsole
          operatorName={profile.displayName}
          canEdit={canEditOps(profile.role)}
          initialConversations={inbox.conversations}
          initialThread={initialThread}
        />
      </div>
    );
  } catch (error) {
    const message =
      error instanceof SupportChatDataError
        ? error.message
        : "Não foi possível carregar o chat do suporte.";

    return (
      <main className="pt-24 pb-12 pl-64 pr-8 lg:pr-12 min-h-screen bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 px-8 py-8">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Support Center indisponível
            </h1>
            <p className="text-sm text-red-100/90 mt-3 leading-relaxed">
              {message}
            </p>
            <p className="text-sm text-neutral-300 mt-4 leading-relaxed">
              Confirme se o banco do produto já recebeu a migration do chat e se as variáveis
              `PRODUCT_SUPABASE_URL` e `PRODUCT_SUPABASE_SERVICE_ROLE_KEY` estão apontando para
              o projeto correto.
            </p>
          </div>
        </div>
      </main>
    );
  }
}
