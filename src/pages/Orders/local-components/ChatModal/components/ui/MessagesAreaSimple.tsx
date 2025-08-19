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
  currentUserId: string;
  isLoading?: boolean;
  loadingText?: string;
}

export function MessagesArea({ 
  messages, 
  currentUserId, 
  isLoading = false,
  loadingText = "Carregando mensagens..." 
}: MessagesAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading && messages.length === 0) {
    return (
      <div className={chatStyles.messages.container}>
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
    <div className={chatStyles.messages.container}>
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
          {messages.map((message, index) => {
            const isCurrentUser = message.sender.id === currentUserId;
            const prevMessage = messages[index - 1];
            const showAvatar = !prevMessage || 
              prevMessage.sender.id !== message.sender.id ||
              (new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime()) > 300000; // 5 minutos

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
