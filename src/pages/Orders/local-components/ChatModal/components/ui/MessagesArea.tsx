/**
 * Componente MessagesArea
 * Responsabilidade única: Exibir lista de mensagens do chat
 */

import { useEffect, useRef } from 'react';
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
}

export function MessagesArea({ 
  messages, 
  currentUserType, 
  isLoading = false,
  loadingText = "Carregando mensagens..." 
}: MessagesAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll para a última mensagem
  useEffect(() => {
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
