import type { AdminAccess } from "@/lib/auth";
import { createProductSourceAdminClient } from "@/lib/supabase/server";
import type {
  SupportConversationStatus,
  SupportConversationSummary,
  SupportConversationThread,
  SupportOperatorIdentity,
  SupportThreadMessage,
} from "@/lib/types";

const SUPPORT_STATUSES: SupportConversationStatus[] = [
  "open",
  "pending_customer",
  "pending_master",
  "resolved",
  "archived",
];

const SUPPORT_LIMITS = {
  list: 50,
  thread: 250,
  subject: 120,
  preview: 160,
  message: 2000,
} as const;

type AdminAccessWithProfile = AdminAccess & {
  profile: NonNullable<AdminAccess["profile"]>;
};

type ProductSupportClient = NonNullable<
  ReturnType<typeof createProductSourceAdminClient>
>;

type SupportOperatorRow = {
  id: string;
  source_system: string;
  external_operator_id: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  is_active: boolean;
};

type SupportConversationRow = {
  id: string;
  public_id: string;
  customer_user_id: string | null;
  assigned_operator_id: string | null;
  status: string;
  origin: string;
  subject: string;
  customer_name: string;
  customer_email: string;
  customer_avatar_url: string | null;
  customer_plan: string;
  last_message_preview: string;
  last_message_at: string | null;
  customer_unread_count: number;
  master_unread_count: number;
  customer_last_read_at: string | null;
  master_last_read_at: string | null;
  customer_last_delivered_at: string | null;
  master_last_delivered_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

type SupportMessageRow = {
  id: string;
  conversation_id: string;
  sender_role: "customer" | "master";
  sender_user_id: string | null;
  sender_operator_id: string | null;
  sender_name: string;
  body: string;
  content_type: "text";
  client_message_id: string | null;
  delivered_at: string | null;
  read_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export class SupportChatDataError extends Error {
  constructor(
    message: string,
    readonly status = 500,
  ) {
    super(message);
    this.name = "SupportChatDataError";
  }
}

export function isSupportConversationStatus(
  value: string | null | undefined,
): value is SupportConversationStatus {
  return SUPPORT_STATUSES.includes(value as SupportConversationStatus);
}

export function sanitizeSupportConversationSubject(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, SUPPORT_LIMITS.subject);
}

export function sanitizeSupportMessageBody(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/\r\n/g, "\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim()
    .slice(0, SUPPORT_LIMITS.message);
}

export function validateSupportMessageBody(body: string) {
  if (!body) {
    return {
      valid: false,
      error: "Digite uma mensagem antes de enviar.",
    };
  }

  return {
    valid: true,
    error: null,
  };
}

export async function listSupportInbox(
  access: AdminAccess,
  options?: {
    limit?: number;
    status?: string | null;
  },
) {
  const resolvedAccess = requireProfiledAccess(access);
  const client = getProductSupportClient();
  await ensureSupportOperator(resolvedAccess);

  let query = client
    .from("support_conversations")
    .select("*")
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false })
    .limit(normalizeListLimit(options?.limit));

  if (options?.status && isSupportConversationStatus(options.status)) {
    query = query.eq("status", options.status);
  }

  const { data, error } = await query;
  if (error) {
    throw new SupportChatDataError(error.message, 500);
  }

  return {
    viewerRole: "master" as const,
    isMaster: true as const,
    conversations: ((data ?? []) as SupportConversationRow[]).map((row) =>
      mapConversationRow(row),
    ),
  };
}

export async function getSupportThread(
  access: AdminAccess,
  conversationId: string,
) {
  const resolvedAccess = requireProfiledAccess(access);
  const client = getProductSupportClient();
  await ensureSupportOperator(resolvedAccess);
  const conversation = await getConversationRow(client, conversationId);

  await markConversationDelivered(client, conversationId);

  const { data, error } = await client
    .from("support_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(SUPPORT_LIMITS.thread);

  if (error) {
    throw new SupportChatDataError(error.message, 500);
  }

  return {
    conversation: mapConversationRow(conversation),
    messages: ((data ?? []) as SupportMessageRow[]).map((row) => mapMessageRow(row)),
    viewerRole: "master",
    isMaster: true,
  } satisfies SupportConversationThread;
}

export async function sendSupportReply(
  access: AdminAccess,
  conversationId: string,
  body: string,
  clientMessageId?: string | null,
) {
  const client = getProductSupportClient();
  const operator = await ensureSupportOperator(requireProfiledAccess(access));
  const conversation = await getConversationRow(client, conversationId);

  const { data, error } = await client
    .from("support_messages")
    .insert({
      conversation_id: conversationId,
      sender_role: "master",
      sender_user_id: null,
      sender_operator_id: operator.operatorId,
      sender_name: operator.displayName,
      body,
      content_type: "text",
      client_message_id: clientMessageId ?? null,
      updated_at: nowIso(),
    })
    .select("*")
    .single();

  if (error) {
    if (
      clientMessageId &&
      error.message.includes("duplicate key value") &&
      error.message.includes("client_message_id")
    ) {
      const { data: existing, error: existingError } = await client
        .from("support_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .eq("client_message_id", clientMessageId)
        .maybeSingle();

      if (existingError) {
        throw new SupportChatDataError(existingError.message, 500);
      }

      if (existing) {
        const refreshedConversation = await getConversationRow(client, conversationId);
        return {
          message: mapMessageRow(existing as SupportMessageRow),
          conversation: mapConversationRow(refreshedConversation),
        };
      }
    }

    throw new SupportChatDataError(error.message, 500);
  }

  const now = nowIso();
  const refreshedConversation = await updateConversationRow(client, conversationId, {
    assigned_operator_id: operator.operatorId,
    status: "pending_customer",
    last_message_preview: body.slice(0, SUPPORT_LIMITS.preview),
    last_message_at: (data as SupportMessageRow).created_at,
    customer_unread_count: (conversation.customer_unread_count ?? 0) + 1,
    master_last_read_at: now,
    updated_at: now,
  });

  return {
    message: mapMessageRow(data as SupportMessageRow),
    conversation: mapConversationRow(refreshedConversation),
  };
}

export async function markSupportThreadRead(
  access: AdminAccess,
  conversationId: string,
) {
  const client = getProductSupportClient();
  await ensureSupportOperator(requireProfiledAccess(access));
  await getConversationRow(client, conversationId);
  const now = nowIso();

  const { error: messageError } = await client
    .from("support_messages")
    .update({
      delivered_at: now,
      read_at: now,
      updated_at: now,
    })
    .eq("conversation_id", conversationId)
    .eq("sender_role", "customer")
    .is("read_at", null);

  if (messageError) {
    throw new SupportChatDataError(messageError.message, 500);
  }

  const conversation = await updateConversationRow(client, conversationId, {
    master_unread_count: 0,
    master_last_read_at: now,
    master_last_delivered_at: now,
    updated_at: now,
  });

  return mapConversationRow(conversation);
}

export async function updateSupportThread(
  access: AdminAccess,
  conversationId: string,
  patch: {
    status?: string | null;
    subject?: string | null;
    assignToSelf?: boolean;
  },
) {
  const client = getProductSupportClient();
  const operator = await ensureSupportOperator(requireProfiledAccess(access));
  await getConversationRow(client, conversationId);

  const nextPatch: Record<string, unknown> = {
    updated_at: nowIso(),
  };

  if (patch.status) {
    if (!isSupportConversationStatus(patch.status)) {
      throw new SupportChatDataError("Status de conversa inválido.", 400);
    }
    nextPatch.status = patch.status;
  }

  if (typeof patch.subject === "string") {
    nextPatch.subject =
      sanitizeSupportConversationSubject(patch.subject) || "Atendimento do suporte";
  }

  if (patch.assignToSelf) {
    nextPatch.assigned_operator_id = operator.operatorId;
  }

  const conversation = await updateConversationRow(
    client,
    conversationId,
    nextPatch,
  );

  return mapConversationRow(conversation);
}

export async function ensureSupportOperator(
  access: AdminAccessWithProfile,
): Promise<SupportOperatorIdentity> {
  const client = getProductSupportClient();
  const displayName =
    access.profile.displayName.trim() || access.user.email || "Operator";

  const { data, error } = await client
    .from("support_operator_accounts")
    .upsert(
      {
        source_system: "command_center",
        external_operator_id: access.user.id,
        display_name: displayName,
        email: access.user.email ?? "",
        avatar_url: null,
        is_active: true,
        metadata: {
          role: access.profile.role,
          source: "command_center",
        },
        updated_at: nowIso(),
      },
      {
        onConflict: "source_system,external_operator_id",
      },
    )
    .select(
      "id, source_system, external_operator_id, display_name, email, avatar_url, is_active",
    )
    .single<SupportOperatorRow>();

  if (error || !data) {
    throw new SupportChatDataError(
      error?.message ||
        "Não foi possível registrar o operador do Command Center no chat.",
      500,
    );
  }

  return {
    operatorId: data.id,
    sourceSystem: data.source_system,
    externalOperatorId: data.external_operator_id,
    displayName: data.display_name,
    email: data.email || null,
    avatarUrl: data.avatar_url,
  };
}

function getProductSupportClient() {
  const client = createProductSourceAdminClient();
  if (!client) {
    throw new SupportChatDataError(
      "PRODUCT_SUPABASE_URL e PRODUCT_SUPABASE_SERVICE_ROLE_KEY precisam apontar para o banco do produto.",
      503,
    );
  }

  return client;
}

function requireProfiledAccess(access: AdminAccess): AdminAccessWithProfile {
  if (!access.profile) {
    throw new SupportChatDataError(
      "Sessão administrativa ausente ou sem perfil para operar o suporte.",
      401,
    );
  }

  return access as AdminAccessWithProfile;
}

async function getConversationRow(
  client: ProductSupportClient,
  conversationId: string,
) {
  const { data, error } = await client
    .from("support_conversations")
    .select("*")
    .eq("id", conversationId)
    .maybeSingle();

  if (error) {
    throw new SupportChatDataError(error.message, 500);
  }

  if (!data) {
    throw new SupportChatDataError("Conversa não encontrada.", 404);
  }

  return data as SupportConversationRow;
}

async function updateConversationRow(
  client: ProductSupportClient,
  conversationId: string,
  patch: Record<string, unknown>,
) {
  const { data, error } = await client
    .from("support_conversations")
    .update(patch)
    .eq("id", conversationId)
    .select("*")
    .single();

  if (error) {
    throw new SupportChatDataError(error.message, 500);
  }

  return data as SupportConversationRow;
}

async function markConversationDelivered(
  client: ProductSupportClient,
  conversationId: string,
) {
  const now = nowIso();

  const { error: messageError } = await client
    .from("support_messages")
    .update({
      delivered_at: now,
      updated_at: now,
    })
    .eq("conversation_id", conversationId)
    .eq("sender_role", "customer")
    .is("delivered_at", null);

  if (messageError) {
    throw new SupportChatDataError(messageError.message, 500);
  }

  await updateConversationRow(client, conversationId, {
    master_last_delivered_at: now,
    updated_at: now,
  });
}

function mapConversationRow(
  row: SupportConversationRow,
): SupportConversationSummary {
  return {
    id: row.id,
    publicId: row.public_id,
    customerUserId: row.customer_user_id,
    assignedOperatorId: row.assigned_operator_id,
    status: isSupportConversationStatus(row.status) ? row.status : "open",
    origin: row.origin,
    subject: row.subject,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerAvatarUrl: row.customer_avatar_url,
    customerPlan: row.customer_plan,
    lastMessagePreview: row.last_message_preview,
    lastMessageAt: row.last_message_at,
    unreadCountForViewer: row.master_unread_count,
    customerUnreadCount: row.customer_unread_count,
    masterUnreadCount: row.master_unread_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    metadata:
      row.metadata && typeof row.metadata === "object" ? row.metadata : {},
  };
}

function mapMessageRow(row: SupportMessageRow): SupportThreadMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderRole: row.sender_role,
    senderUserId: row.sender_user_id,
    senderOperatorId: row.sender_operator_id,
    senderName: row.sender_name,
    body: row.body,
    contentType: "text",
    clientMessageId: row.client_message_id,
    deliveredAt: row.delivered_at,
    readAt: row.read_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    metadata:
      row.metadata && typeof row.metadata === "object" ? row.metadata : {},
  };
}

function normalizeListLimit(limit?: number) {
  if (!limit || Number.isNaN(limit)) {
    return SUPPORT_LIMITS.list;
  }

  return Math.min(Math.max(Math.floor(limit), 1), SUPPORT_LIMITS.list);
}

function nowIso() {
  return new Date().toISOString();
}
