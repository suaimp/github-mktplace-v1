/**
 * Componente MessagesArea
 * Responsabilidade única: Exibir lista de mensagens do chat
 */

import { useEffect, useRef, useLayoutEffect } from 'react';
import { chatStyles } from '../../styles';
import { Message } from './Message';

interface ChatMessage {
  id: string;
  content: string;
  timestamp: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
    type: 'user' | 'admin';
  };
  isRead: boolean;
}

interface MessagesAreaProps {
  messages: ChatMessage[];
  currentUserType: 'user' | 'admin' | null;
  isLoading?: boolean;
  loadingText?: string;
  hasMore?: boolean;           // Se há mais mensagens para carregar
  onLoadMore?: () => void;     // Callback para carregar mais
  startAtBottom?: boolean;     // Iniciar com scroll no fim
}

export function MessagesArea({ 
  messages, 
  currentUserType, 
  isLoading = false,
  loadingText = "Carregando mensagens...",
  hasMore = false,
  onLoadMore,
  startAtBottom = true
}: MessagesAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);
  const prevScrollHeightRef = useRef<number>(0);
  const prevScrollTopRef = useRef<number>(0);
  const justDidInitialBottomRef = useRef(false);

  // Posiciona no final antes da pintura inicial (ou quando mensagens chegam pela primeira vez)
  useLayoutEffect(() => {
    if (!startAtBottom) return;
    const el = containerRef.current;
    if (!el) return;
    // Só faz na primeira oportunidade em que existir conteúdo
    if (messages.length > 0 && !justDidInitialBottomRef.current) {
      el.scrollTop = el.scrollHeight;
      justDidInitialBottomRef.current = true; // Usado para pular o smooth na primeira atualização
    }
  }, [startAtBottom, messages.length]);

  // Auto scroll para a última mensagem
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (loadingMoreRef.current) {
      // Manter posição ao adicionar mensagens no topo
      const newScrollHeight = container.scrollHeight;
      const added = newScrollHeight - prevScrollHeightRef.current;
      container.scrollTop = prevScrollTopRef.current + added;
      loadingMoreRef.current = false;
      return;
    }

    // Evita animar imediatamente após posicionar no fundo ao abrir
    if (justDidInitialBottomRef.current) {
      justDidInitialBottomRef.current = false;
      return;
    }

    // Auto scroll para o fim em novas mensagens normais
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Previne que o scroll "vaze" para o body quando alcança topo/fundo
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const atTop = el.scrollTop === 0;
      const atBottom = Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight;
      const deltaY = e.deltaY;
      if ((atTop && deltaY < 0) || (atBottom && deltaY > 0)) {
        e.preventDefault();
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel as EventListener);
  }, []);

  // Dispara onLoadMore automaticamente ao chegar no topo do scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !hasMore || !onLoadMore) return;

    const TOP_THRESHOLD = 16; // px
    const onScroll = () => {
      if (el.scrollTop <= TOP_THRESHOLD && hasMore && !loadingMoreRef.current) {
        loadingMoreRef.current = true;
        prevScrollHeightRef.current = el.scrollHeight;
        prevScrollTopRef.current = el.scrollTop;
        onLoadMore();
      }
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [hasMore, onLoadMore]);

  if (isLoading && messages.length === 0) {
    return (
  <div ref={containerRef} className={chatStyles.messages.container + ' overscroll-contain'}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {loadingText}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
  <div ref={containerRef} className={chatStyles.messages.container + ' overscroll-contain'}>
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              Nenhuma mensagem ainda
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Inicie uma conversa enviando uma mensagem
            </p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message) => {
            const isCurrentUser = message.sender.type === currentUserType;
            // Sempre mostrar avatar para mensagens recebidas (removida a lógica de sequência)
            const showAvatar = true;

            return (
              <Message
                key={message.id}
                type={isCurrentUser ? 'sent' : 'received'}
                content={message.content}
                timestamp={message.timestamp}
                sender={!isCurrentUser ? message.sender : undefined}
                showAvatar={!isCurrentUser && showAvatar}
              />
            );
          })}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}
