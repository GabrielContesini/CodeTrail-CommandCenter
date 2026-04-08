"use client";

import { MaterialIcon } from "@/components/icons/material-icon";
import type {
    SupportConversationSummary,
    SupportConversationThread,
    SupportThreadMessage,
} from "@/lib/types";
import { cn, formatDateTime, formatRelativeTime } from "@/lib/utils";
import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type Dispatch,
    type KeyboardEvent,
    type ReactNode,
    type SetStateAction,
} from "react";

const LIST_REFRESH_VISIBLE_MS = 5000;
const LIST_REFRESH_HIDDEN_MS = 15000;
const THREAD_REFRESH_VISIBLE_MS = 1500;
const THREAD_REFRESH_HIDDEN_MS = 5000;
const COMPOSER_LIMIT = 2000;
const AUTOSCROLL_THRESHOLD_PX = 96;

type LocalSupportMessage = SupportThreadMessage & {
  optimistic?: boolean;
};

type InboxApiResponse = {
  ok: boolean;
  conversations?: SupportConversationSummary[];
  error?: string;
};

type ThreadApiResponse = {
  ok: boolean;
  conversation?: SupportConversationSummary;
  messages?: SupportThreadMessage[];
  error?: string;
};

type MessageApiResponse = {
  ok: boolean;
  message?: SupportThreadMessage;
  conversation?: SupportConversationSummary;
  error?: string;
};

type ConversationApiResponse = {
  ok: boolean;
  conversation?: SupportConversationSummary;
  error?: string;
};

export function SupportConsole({
  operatorName,
  canEdit,
  initialConversations,
  initialThread,
}: {
  operatorName: string;
  canEdit: boolean;
  initialConversations: SupportConversationSummary[];
  initialThread: SupportConversationThread | null;
}) {
  const [conversations, setConversations] =
    useState<SupportConversationSummary[]>(initialConversations);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(initialThread?.conversation.id ?? initialConversations[0]?.id ?? null);
  const [messages, setMessages] = useState<LocalSupportMessage[]>(
    initialThread?.messages ?? [],
  );
  const [composer, setComposer] = useState("");
  const [listLoading, setListLoading] = useState(
    initialConversations.length === 0,
  );
  const [threadLoading, setThreadLoading] = useState(
    Boolean(selectedConversationId) && !initialThread,
  );
  const [sending, setSending] = useState(false);
  const [actionLoading, setActionLoading] = useState<
    "assign" | "resolve" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [isWindowVisible, setIsWindowVisible] = useState(
    () =>
      typeof document === "undefined" || document.visibilityState === "visible",
  );
  const threadLockRef = useRef(false);
  const threadViewportRef = useRef<HTMLDivElement | null>(null);
  const shouldStickToBottomRef = useRef(true);
  const shouldShowInitialListLoader = initialConversations.length === 0;

  const activeConversation = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.id === selectedConversationId,
      ) ??
      initialThread?.conversation ??
      null,
    [conversations, initialThread?.conversation, selectedConversationId],
  );

  const activeMetadataEntries = useMemo(
    () => Object.entries(activeConversation?.metadata ?? {}),
    [activeConversation?.metadata],
  );

  useEffect(() => {
    if (!conversations.length) {
      setSelectedConversationId(null);
      setMessages([]);
      return;
    }

    if (!selectedConversationId) {
      setSelectedConversationId(conversations[0]?.id ?? null);
      return;
    }

    if (
      !conversations.some(
        (conversation) => conversation.id === selectedConversationId,
      )
    ) {
      setSelectedConversationId(conversations[0]?.id ?? null);
    }
  }, [conversations, selectedConversationId]);

  useEffect(() => {
    function handleVisibilityChange() {
      setIsWindowVisible(document.visibilityState === "visible");
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadInbox(showLoader: boolean) {
      if (showLoader) {
        setListLoading(true);
      }

      try {
        const response = await fetch(
          "/api/admin/support/conversations?limit=50",
          {
            cache: "no-store",
          },
        );
        const result = (await readJson<InboxApiResponse>(response)) ?? null;

        if (!active) {
          return;
        }

        if (!response.ok) {
          setError(
            result?.error ?? "Não foi possível carregar a inbox de suporte.",
          );
          return;
        }

        setConversations(result?.conversations ?? []);
        setError(null);
      } catch {
        if (active) {
          setError("Não foi possível carregar a inbox de suporte.");
        }
      } finally {
        if (active && showLoader) {
          setListLoading(false);
        }
      }
    }

    void loadInbox(shouldShowInitialListLoader);

    const interval = window.setInterval(
      () => {
        void loadInbox(false);
      },
      isWindowVisible ? LIST_REFRESH_VISIBLE_MS : LIST_REFRESH_HIDDEN_MS,
    );

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [isWindowVisible, shouldShowInitialListLoader]);

  useEffect(() => {
    if (!selectedConversationId) {
      return;
    }

    let active = true;

    async function loadThread(showLoader: boolean) {
      const conversationId = selectedConversationId;

      if (!conversationId) {
        return;
      }

      if (threadLockRef.current) {
        return;
      }

      threadLockRef.current = true;

      if (showLoader) {
        setThreadLoading(true);
      }

      try {
        const response = await fetch(
          `/api/admin/support/conversations/${conversationId}`,
          {
            cache: "no-store",
          },
        );
        const result = (await readJson<ThreadApiResponse>(response)) ?? null;

        if (!active) {
          return;
        }

        if (!response.ok || !result?.conversation) {
          setError(result?.error ?? "Não foi possível carregar a conversa.");
          return;
        }

        setConversations((current) =>
          upsertConversation(current, result.conversation!),
        );
        setMessages(result.messages ?? []);
        setError(null);

        if (hasUnreadIncomingMessage(result.messages ?? [])) {
          await markConversationAsRead(
            conversationId,
            active,
            setConversations,
            setMessages,
          );
        }
      } catch {
        if (active) {
          setError("Não foi possível carregar a conversa.");
        }
      } finally {
        threadLockRef.current = false;
        if (active && showLoader) {
          setThreadLoading(false);
        }
      }
    }

    const threadAlreadyLoaded =
      initialThread?.conversation.id === selectedConversationId &&
      Boolean(initialThread?.messages.length);

    void loadThread(!threadAlreadyLoaded);

    const interval = window.setInterval(
      () => {
        void loadThread(false);
      },
      isWindowVisible ? THREAD_REFRESH_VISIBLE_MS : THREAD_REFRESH_HIDDEN_MS,
    );

    return () => {
      active = false;
      threadLockRef.current = false;
      window.clearInterval(interval);
    };
  }, [
    initialThread?.conversation.id,
    initialThread?.messages.length,
    isWindowVisible,
    selectedConversationId,
  ]);

  useEffect(() => {
    const viewport = threadViewportRef.current;

    if (!viewport) {
      return;
    }

    const nextViewport = viewport;

    function handleScroll() {
      const distance =
        nextViewport.scrollHeight -
        nextViewport.scrollTop -
        nextViewport.clientHeight;
      shouldStickToBottomRef.current = distance <= AUTOSCROLL_THRESHOLD_PX;
    }

    handleScroll();
    nextViewport.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      nextViewport.removeEventListener("scroll", handleScroll);
    };
  }, [selectedConversationId]);

  useEffect(() => {
    const viewport = threadViewportRef.current;

    if (!viewport || !shouldStickToBottomRef.current) {
      return;
    }

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: messages.length <= 1 ? "auto" : "smooth",
    });
  }, [messages, selectedConversationId]);

  async function handleSendMessage() {
    if (!canEdit || !activeConversation || sending) {
      return;
    }

    const body = composer.trim();
    if (!body) {
      setError("Digite uma mensagem antes de enviar.");
      return;
    }

    const clientMessageId = createClientMessageId();
    const previousConversation = activeConversation;
    const optimisticMessage: LocalSupportMessage = {
      id: `optimistic-${clientMessageId}`,
      conversationId: activeConversation.id,
      senderRole: "master",
      senderUserId: null,
      senderOperatorId: null,
      senderName: operatorName,
      body,
      contentType: "text",
      clientMessageId,
      deliveredAt: null,
      readAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {},
      optimistic: true,
    };

    setSending(true);
    setComposer("");
    setError(null);
    setMessages((current) => upsertMessage(current, optimisticMessage));
    setConversations((current) => {
      const currentConversation =
        current.find(
          (conversation) => conversation.id === activeConversation.id,
        ) ?? previousConversation;

      if (!currentConversation) {
        return current;
      }

      return upsertConversation(current, {
        ...currentConversation,
        assignedOperatorId: currentConversation.assignedOperatorId ?? "self",
        status: "pending_customer",
        lastMessageAt: optimisticMessage.createdAt,
        lastMessagePreview: optimisticMessage.body,
      });
    });

    try {
      const response = await fetch(
        `/api/admin/support/conversations/${activeConversation.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            body,
            clientMessageId,
          }),
        },
      );
      const result = (await readJson<MessageApiResponse>(response)) ?? null;

      if (!response.ok || !result?.message) {
        setMessages((current) =>
          current.filter(
            (message) => message.clientMessageId !== clientMessageId,
          ),
        );
        if (previousConversation) {
          setConversations((current) =>
            upsertConversation(current, previousConversation),
          );
        }
        setComposer(body);
        setError(result?.error ?? "Não foi possível enviar a mensagem agora.");
        return;
      }

      setMessages((current) => upsertMessage(current, result.message!));
      if (result.conversation) {
        setConversations((current) =>
          upsertConversation(current, result.conversation!),
        );
      }
    } catch {
      setMessages((current) =>
        current.filter(
          (message) => message.clientMessageId !== clientMessageId,
        ),
      );
      if (previousConversation) {
        setConversations((current) =>
          upsertConversation(current, previousConversation),
        );
      }
      setComposer(body);
      setError("Não foi possível enviar a mensagem agora.");
    } finally {
      setSending(false);
    }
  }

  async function handleConversationPatch(patch: {
    status?: SupportConversationSummary["status"];
    assignToSelf?: boolean;
  }) {
    if (!canEdit || !activeConversation) {
      return;
    }

    const nextAction = patch.assignToSelf ? "assign" : "resolve";
    setActionLoading(nextAction);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/support/conversations/${activeConversation.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(patch),
        },
      );
      const result =
        (await readJson<ConversationApiResponse>(response)) ?? null;

      if (!response.ok || !result?.conversation) {
        setError(result?.error ?? "Não foi possível atualizar a conversa.");
        return;
      }

      setConversations((current) =>
        upsertConversation(current, result.conversation!),
      );
    } catch {
      setError("Não foi possível atualizar a conversa.");
    } finally {
      setActionLoading(null);
    }
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    void handleSendMessage();
  }

  return (
    <div className="flex h-full min-h-0 overflow-hidden rounded-xl border border-white/[0.06] bg-[#0a0a0a]">
      {/* ─── Inbox Panel ─── */}
      <aside className="hidden w-[300px] shrink-0 flex-col border-r border-white/[0.06] bg-[#101010] lg:flex">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <h2 className="text-[15px] font-bold tracking-tight text-white">
            Messages
          </h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-white/[0.04] hover:text-neutral-300"
            >
              <MaterialIcon name="edit_square" className="text-[18px]" />
            </button>
            <button
              type="button"
              className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-white/[0.04] hover:text-neutral-300"
            >
              <MaterialIcon name="tune" className="text-[18px]" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {listLoading && conversations.length === 0 ? (
            <PanelEmptyState
              icon="hourglass_top"
              title="Sincronizando inbox"
              description="Carregando as conversas e o contexto inicial do atendimento."
            />
          ) : conversations.length === 0 ? (
            <PanelEmptyState
              icon="chat_bubble"
              title="Nenhuma conversa ativa"
              description="Quando um cliente abrir atendimento, a fila aparece aqui."
            />
          ) : (
            <div className="py-1">
              {conversations.map((conversation) => {
                const isActive = conversation.id === selectedConversationId;

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => {
                      setSelectedConversationId(conversation.id);
                      setMessages([]);
                    }}
                    className={cn(
                      "group flex w-full items-start gap-3 border-l-2 px-4 py-3.5 text-left transition-all",
                      isActive
                        ? "border-l-cyan-400 bg-cyan-400/[0.06]"
                        : "border-l-transparent hover:bg-white/[0.02]",
                    )}
                  >
                    <SupportAvatar
                      name={conversation.customerName}
                      avatarUrl={conversation.customerAvatarUrl}
                      size="md"
                      highlighted={isActive}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className={cn(
                              "truncate text-sm font-semibold",
                              isActive ? "text-cyan-300" : "text-white",
                            )}
                          >
                            {conversation.customerName}
                          </span>
                          {conversation.status !== "resolved" &&
                          conversation.status !== "archived" ? (
                            <span className="shrink-0 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-400">
                              {labelForStatus(conversation.status)}
                            </span>
                          ) : (
                            <span className="shrink-0 rounded bg-white/[0.06] px-1.5 py-0.5 text-[9px] font-bold uppercase text-neutral-500">
                              {labelForStatus(conversation.status)}
                            </span>
                          )}
                        </div>
                        <span className="shrink-0 text-[11px] text-neutral-500">
                          {formatRelativeTime(
                            conversation.lastMessageAt ||
                              conversation.updatedAt,
                          )}
                        </span>
                      </div>

                      <p className="mt-1 truncate text-[13px] leading-relaxed text-neutral-400">
                        {conversation.lastMessagePreview ||
                          "Aguardando primeira mensagem..."}
                      </p>

                      {conversation.unreadCountForViewer > 0 ? (
                        <span className="mt-1.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-cyan-400 px-1 text-[10px] font-black text-black">
                          {conversation.unreadCountForViewer}
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* ─── Thread Panel ─── */}
      <section className="flex min-w-0 flex-1 flex-col bg-[#0d0d0d]">
        <header className="flex items-center justify-between border-b border-white/[0.06] bg-[#111111] px-5 py-3">
          {activeConversation ? (
            <>
              <div className="flex min-w-0 items-center gap-3">
                <SupportAvatar
                  name={activeConversation.customerName}
                  avatarUrl={activeConversation.customerAvatarUrl}
                  size="lg"
                  highlighted
                />
                <div className="min-w-0">
                  <h3 className="truncate text-[15px] font-bold text-white">
                    {activeConversation.customerName}
                  </h3>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="rounded border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cyan-300">
                      {activeConversation.customerPlan || "Conta autenticada"}
                    </span>
                    <span className="text-[10px] text-neutral-600">·</span>
                    <StatusBadge status={activeConversation.status} />
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => {
                    void handleConversationPatch({ assignToSelf: true });
                  }}
                  disabled={!canEdit || actionLoading !== null}
                  className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-white/[0.04] hover:text-cyan-300 disabled:opacity-40"
                  title={
                    actionLoading === "assign"
                      ? "Assumindo..."
                      : "Assumir conversa"
                  }
                >
                  <MaterialIcon name="support_agent" className="text-[20px]" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void handleConversationPatch({
                      status:
                        activeConversation.status === "resolved"
                          ? "open"
                          : "resolved",
                    });
                  }}
                  disabled={!canEdit || actionLoading !== null}
                  className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-white/[0.04] hover:text-cyan-300 disabled:opacity-40"
                  title={
                    activeConversation.status === "resolved"
                      ? "Reabrir"
                      : "Resolver"
                  }
                >
                  <MaterialIcon
                    name={
                      actionLoading === "resolve"
                        ? "progress_activity"
                        : activeConversation.status === "resolved"
                          ? "undo"
                          : "check_circle"
                    }
                    className="text-[20px]"
                    filled={actionLoading !== "resolve"}
                  />
                </button>
                <button
                  type="button"
                  className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-white/[0.04] hover:text-neutral-300"
                >
                  <MaterialIcon name="search" className="text-[20px]" />
                </button>
                <button
                  type="button"
                  className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-white/[0.04] hover:text-neutral-300"
                >
                  <MaterialIcon name="more_vert" className="text-[20px]" />
                </button>
              </div>
            </>
          ) : (
            <div>
              <h3 className="text-[15px] font-bold text-white">
                Selecione uma conversa
              </h3>
              <p className="mt-0.5 text-xs text-neutral-500">
                A thread ativa aparece aqui com as respostas e ações de
                atendimento.
              </p>
            </div>
          )}
        </header>

        <div className="min-h-0 flex-1 overflow-hidden">
          <div
            ref={threadViewportRef}
            className="h-full overflow-y-auto px-5 py-6 sm:px-7"
          >
            {threadLoading && messages.length === 0 ? (
              <ThreadState
                icon="hourglass_top"
                title="Carregando thread"
                description="Buscando as mensagens e atualizando o contexto do atendimento."
              />
            ) : !activeConversation ? (
              <ThreadState
                icon="chat"
                title="Nenhuma conversa selecionada"
                description="Escolha um item da inbox para abrir a thread e responder sem sair da fila."
              />
            ) : messages.length === 0 ? (
              <ThreadState
                icon="mark_chat_unread"
                title="Canal pronto para atendimento"
                description="A thread aparecerá aqui assim que o cliente enviar a primeira mensagem."
              />
            ) : (
              <div className="mx-auto flex max-w-5xl flex-col gap-5">
                {messages.map((message, index) => {
                  const previous = messages[index - 1];
                  const showDaySeparator =
                    !previous ||
                    formatDayLabel(previous.createdAt) !==
                      formatDayLabel(message.createdAt);

                  return (
                    <div key={message.id} className="space-y-4">
                      {showDaySeparator ? (
                        <div className="flex items-center gap-3 py-2">
                          <div className="h-px flex-1 bg-white/[0.06]" />
                          <span className="rounded-full border border-white/[0.08] bg-[#161616] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">
                            {formatDayLabel(message.createdAt)}
                          </span>
                          <div className="h-px flex-1 bg-white/[0.06]" />
                        </div>
                      ) : null}

                      <MessageRow
                        activeConversation={activeConversation}
                        message={message}
                        operatorName={operatorName}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <footer className="border-t border-white/[0.06] bg-[#111111] px-4 py-3">
          {error ? (
            <div className="mb-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-[13px] text-red-200">
              {error}
            </div>
          ) : null}

          <div className="flex items-end gap-3">
            <button
              type="button"
              className="shrink-0 rounded-full p-2 text-neutral-500 transition-colors hover:bg-white/[0.04] hover:text-neutral-300"
            >
              <MaterialIcon name="add" className="text-[22px]" />
            </button>

            <div className="relative flex-1">
              <textarea
                className="max-h-32 min-h-[42px] w-full resize-none rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 pr-10 text-sm leading-relaxed text-white outline-none placeholder:text-neutral-500 disabled:opacity-50"
                placeholder={canEdit ? "Type a message..." : "Modo leitura"}
                value={composer}
                onChange={(event) => setComposer(event.target.value)}
                onKeyDown={handleComposerKeyDown}
                disabled={!activeConversation || !canEdit || sending}
                maxLength={COMPOSER_LIMIT}
                rows={1}
              />
              <button
                type="button"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-neutral-500 transition-colors hover:text-neutral-300"
              >
                <MaterialIcon name="mood" className="text-[20px]" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                void handleSendMessage();
              }}
              disabled={
                !activeConversation || !canEdit || sending || !composer.trim()
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-black transition-colors hover:bg-cyan-300 disabled:opacity-40"
            >
              <MaterialIcon
                name={sending ? "progress_activity" : "send"}
                className="text-[18px]"
                filled={!sending}
              />
            </button>
          </div>
        </footer>
      </section>

      {/* ─── Context Panel ─── */}
      <aside className="hidden w-[340px] shrink-0 flex-col border-l border-white/[0.06] bg-[#101010] 2xl:flex">
        {activeConversation ? (
          <>
            <div className="border-b border-white/[0.06] px-6 py-6 text-center">
              <div className="mx-auto mb-3 flex justify-center">
                <SupportAvatar
                  name={activeConversation.customerName}
                  avatarUrl={activeConversation.customerAvatarUrl}
                  size="xl"
                  highlighted
                />
              </div>
              <span className="inline-block rounded border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-cyan-300">
                {getPriorityLabel(activeConversation)}
              </span>
              <h3 className="mt-3 text-lg font-bold text-white">
                {activeConversation.customerName}
              </h3>
              <p className="mt-1 text-[13px] text-neutral-400">
                {activeConversation.customerEmail ||
                  activeConversation.subject ||
                  "Conta autenticada"}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <ContextActionButton icon="person" label="Profile" />
                <ContextActionButton
                  icon="admin_panel_settings"
                  label="Permissions"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="space-y-5">
                <ContextSection title="Live Session Data">
                  <ContextDataCard
                    icon="location_on"
                    label="Origem"
                    value={activeConversation.origin || "Não informado"}
                  />
                  <ContextDataCard
                    icon="confirmation_number"
                    label="Ticket"
                    value={`#${activeConversation.publicId}`}
                  />
                  <ContextDataCard
                    icon="schedule"
                    label="Última atividade"
                    value={formatDateTime(
                      activeConversation.lastMessageAt ||
                        activeConversation.updatedAt,
                    )}
                  />
                  <ContextDataCard
                    icon="shield"
                    label="Plano"
                    value={
                      activeConversation.customerPlan || "Conta autenticada"
                    }
                  />
                </ContextSection>

                <ContextSection title="Atendimento">
                  <ContextDataCard
                    icon="person_check"
                    label="Atribuição"
                    value={getAssignmentLabel(activeConversation)}
                  />
                  <ContextDataCard
                    icon="mark_chat_unread"
                    label="Pendentes para suporte"
                    value={`${activeConversation.masterUnreadCount}`}
                  />
                </ContextSection>

                {activeMetadataEntries.length > 0 ? (
                  <ContextSection title="Metadados">
                    {activeMetadataEntries.map(([key, value]) => (
                      <ContextDataCard
                        key={key}
                        icon="data_object"
                        label={key}
                        value={
                          typeof value === "string"
                            ? value
                            : JSON.stringify(value)
                        }
                      />
                    ))}
                  </ContextSection>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => {
                  void handleConversationPatch({
                    status:
                      activeConversation.status === "resolved"
                        ? "open"
                        : "resolved",
                  });
                }}
                disabled={!canEdit || actionLoading !== null}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-3 text-sm font-bold uppercase tracking-wider text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-40"
              >
                <MaterialIcon
                  name={
                    activeConversation.status === "resolved" ? "undo" : "cancel"
                  }
                  className="text-lg"
                  filled
                />
                {actionLoading === "resolve"
                  ? "Atualizando..."
                  : activeConversation.status === "resolved"
                    ? "Reabrir sessão"
                    : "Encerrar sessão"}
              </button>
            </div>
          </>
        ) : (
          <PanelEmptyState
            icon="search"
            title="Sem contexto carregado"
            description="Selecione uma conversa para ver o perfil."
          />
        )}
      </aside>
    </div>
  );
}

function labelForStatus(status: SupportConversationSummary["status"]) {
  switch (status) {
    case "open":
      return "Aberta";
    case "pending_customer":
      return "Aguardando cliente";
    case "pending_master":
      return "Aguardando suporte";
    case "resolved":
      return "Resolvida";
    case "archived":
      return "Arquivada";
    default:
      return status;
  }
}

function getAssignmentLabel(conversation: SupportConversationSummary) {
  return conversation.assignedOperatorId ? "Em atendimento" : "Fila geral";
}

function getPriorityLabel(conversation: SupportConversationSummary) {
  if (conversation.masterUnreadCount > 3) return "Priority A";
  if (conversation.masterUnreadCount > 0) return "Priority B";
  if (conversation.status === "pending_master") return "Priority B";
  return "Priority C";
}

function getStatusTone(status: SupportConversationSummary["status"]) {
  switch (status) {
    case "resolved":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
    case "pending_customer":
      return "border-cyan-400/20 bg-cyan-400/10 text-cyan-200";
    case "pending_master":
      return "border-amber-400/20 bg-amber-400/10 text-amber-200";
    case "archived":
      return "border-white/10 bg-white/[0.05] text-neutral-500";
    default:
      return "border-white/[0.08] bg-white/[0.04] text-neutral-400";
  }
}

function StatusBadge({
  status,
}: {
  status: SupportConversationSummary["status"];
}) {
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]",
        getStatusTone(status),
      )}
    >
      {labelForStatus(status)}
    </span>
  );
}

function PanelEmptyState({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-full min-h-56 items-center justify-center p-6">
      <div className="max-w-sm text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.04] text-neutral-500">
          <MaterialIcon name={icon} className="text-lg" />
        </div>
        <h4 className="mt-4 text-sm font-bold text-white">{title}</h4>
        <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function ThreadState({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="max-w-md rounded-2xl border border-white/[0.06] bg-[#131313] px-8 py-7 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
          <MaterialIcon name={icon} className="text-xl" />
        </div>
        <h4 className="mt-4 text-lg font-bold text-white">{title}</h4>
        <p className="mt-2 text-sm leading-relaxed text-neutral-400">
          {description}
        </p>
      </div>
    </div>
  );
}

function MessageRow({
  activeConversation,
  message,
  operatorName,
}: {
  activeConversation: SupportConversationSummary;
  message: LocalSupportMessage;
  operatorName: string;
}) {
  const isOwn = message.senderRole === "master";
  const senderLabel = isOwn
    ? message.senderName || operatorName || "Você"
    : activeConversation.customerName;

  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "flex max-w-[80%] gap-2.5",
          isOwn ? "flex-row-reverse" : "flex-row",
        )}
      >
        {isOwn ? (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-400/12 text-cyan-300">
            <MaterialIcon name="shield_with_heart" className="text-sm" filled />
          </div>
        ) : (
          <SupportAvatar
            name={activeConversation.customerName}
            avatarUrl={activeConversation.customerAvatarUrl}
            size="sm"
            highlighted={false}
          />
        )}

        <div
          className={cn(
            "min-w-0 space-y-1",
            isOwn ? "items-end text-right" : "",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-2",
              isOwn ? "justify-end" : "justify-start",
            )}
          >
            <span className="text-[11px] font-semibold text-neutral-400">
              {senderLabel}
            </span>
          </div>

          <div
            className={cn(
              "rounded-2xl px-4 py-3 text-sm leading-relaxed",
              isOwn
                ? "rounded-tr-md bg-gradient-to-br from-cyan-600/90 to-cyan-700/80 text-white"
                : "rounded-tl-md border border-white/[0.06] bg-[#1a1a1a] text-neutral-200",
            )}
          >
            {message.body}
          </div>

          <div
            className={cn(
              "flex items-center gap-1.5 text-[10px] text-neutral-600",
              isOwn ? "justify-end" : "justify-start",
            )}
          >
            <span>{formatTimeLabel(message.createdAt)}</span>
            {isOwn ? <MessageReceipt message={message} /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function SupportAvatar({
  name,
  avatarUrl,
  size,
  highlighted,
}: {
  name: string;
  avatarUrl: string | null;
  size: "sm" | "md" | "lg" | "xl";
  highlighted: boolean;
}) {
  const sizeClassName =
    size === "xl"
      ? "h-20 w-20 rounded-full"
      : size === "lg"
        ? "h-11 w-11 rounded-full"
        : size === "md"
          ? "h-10 w-10 rounded-full"
          : "h-8 w-8 rounded-full";
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase();

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className={cn(
          sizeClassName,
          "shrink-0 border-2 object-cover bg-black/30",
          highlighted
            ? "border-cyan-400/50 shadow-[0_0_12px_rgba(0,229,255,0.15)]"
            : "border-white/10",
        )}
        src={avatarUrl}
        alt={name}
      />
    );
  }

  return (
    <div
      className={cn(
        sizeClassName,
        "flex shrink-0 items-center justify-center border-2 bg-gradient-to-br from-neutral-800 to-neutral-900 text-xs font-bold text-white",
        highlighted
          ? "border-cyan-400/50 shadow-[0_0_12px_rgba(0,229,255,0.15)]"
          : "border-white/10",
      )}
    >
      {initials}
    </div>
  );
}

function MessageReceipt({ message }: { message: LocalSupportMessage }) {
  if (message.optimistic) {
    return (
      <span className="inline-flex items-center gap-1 text-neutral-600">
        <MaterialIcon name="schedule" className="text-xs" />
      </span>
    );
  }

  if (message.readAt) {
    return (
      <span className="inline-flex items-center gap-1 text-cyan-400">
        <MaterialIcon name="done_all" className="text-xs" filled />
      </span>
    );
  }

  if (message.deliveredAt) {
    return (
      <span className="inline-flex items-center gap-1 text-neutral-500">
        <MaterialIcon name="done_all" className="text-xs" filled />
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-neutral-500">
      <MaterialIcon name="done" className="text-xs" filled />
    </span>
  );
}

function ContextActionButton({ icon, label }: { icon: string; label: string }) {
  return (
    <button
      type="button"
      className="flex flex-col items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-3 text-neutral-400 transition-colors hover:border-cyan-400/30 hover:text-cyan-300"
    >
      <MaterialIcon name={icon} className="text-[20px]" />
      <span className="text-[10px] font-bold uppercase tracking-wider">
        {label}
      </span>
    </button>
  );
}

function ContextSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">
        {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ContextDataCard({
  icon,
  label,
  value,
  badge,
}: {
  icon: string;
  label: string;
  value: string;
  badge?: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-600">
        {label}
      </p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <MaterialIcon name={icon} className="text-sm text-cyan-400" />
          <span className="truncate text-sm text-white">{value}</span>
        </div>
        {badge ? (
          <span className="shrink-0 rounded border border-cyan-400/20 bg-cyan-400/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-cyan-300">
            {badge}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function formatTimeLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDayLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function hasUnreadIncomingMessage(messages: SupportThreadMessage[]) {
  return messages.some(
    (message) => message.senderRole === "customer" && !message.readAt,
  );
}

async function markConversationAsRead(
  conversationId: string,
  active: boolean,
  setConversations: Dispatch<SetStateAction<SupportConversationSummary[]>>,
  setMessages: Dispatch<SetStateAction<LocalSupportMessage[]>>,
) {
  try {
    const response = await fetch(
      `/api/admin/support/conversations/${conversationId}/read`,
      {
        method: "POST",
      },
    );
    const result = (await readJson<ConversationApiResponse>(response)) ?? null;

    if (!response.ok || !active) {
      return;
    }

    if (result?.conversation) {
      setConversations((current) =>
        upsertConversation(current, result.conversation!),
      );
    }

    const readAt = new Date().toISOString();
    setMessages((current) =>
      current.map((message) =>
        message.senderRole === "master"
          ? message
          : {
              ...message,
              deliveredAt: message.deliveredAt ?? readAt,
              readAt: message.readAt ?? readAt,
            },
      ),
    );
  } catch {
    // Silent retry on the next poll cycle.
  }
}

function upsertConversation(
  current: SupportConversationSummary[],
  nextConversation: SupportConversationSummary,
) {
  const withoutCurrent = current.filter(
    (conversation) => conversation.id !== nextConversation.id,
  );

  return [nextConversation, ...withoutCurrent].sort((left, right) => {
    const leftValue = left.lastMessageAt || left.updatedAt;
    const rightValue = right.lastMessageAt || right.updatedAt;
    return rightValue.localeCompare(leftValue);
  });
}

function upsertMessage(
  current: LocalSupportMessage[],
  nextMessage: LocalSupportMessage | SupportThreadMessage,
) {
  const withoutCurrent = current.filter((message) => {
    if (message.id === nextMessage.id) {
      return false;
    }

    if (
      nextMessage.clientMessageId &&
      message.clientMessageId &&
      message.clientMessageId === nextMessage.clientMessageId
    ) {
      return false;
    }

    return true;
  });

  return [...withoutCurrent, nextMessage].sort((left, right) =>
    left.createdAt.localeCompare(right.createdAt),
  );
}

function createClientMessageId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `cc-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function readJson<T>(response: Response) {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}
