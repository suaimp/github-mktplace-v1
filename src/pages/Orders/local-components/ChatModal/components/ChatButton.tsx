/**
 * Componente de botão para abrir o chat
 */

import { useState, useEffect } from 'react';
import { OrderChatService } from '../../../../../db-service/order-chat';

interface ChatButtonProps {
  orderId: string;
  orderItemId: string;
  entryId?: string;
  onOpenChat: () => void;
  className?: string;
}

export function ChatButton({ 
 
  orderItemId, 
 
  onOpenChat, 
  className = '' 
}: ChatButtonProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadChatStats = async () => {
      try {
        setIsLoading(true);
        const stats = await OrderChatService.getChatStats(orderItemId);
        setUnreadCount(stats.unread_messages);
      } catch (error) {
        console.error('Erro ao carregar estatísticas do chat:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChatStats();

    // Setup realtime listener para estatísticas
    const channel = OrderChatService.subscribeToMessages(orderItemId, () => {
      // Recarregar estatísticas quando nova mensagem chegar
      loadChatStats();
    });

    return () => {
      OrderChatService.unsubscribeFromMessages(channel);
    };
  }, [orderItemId]);

  const handleClick = () => {
    // Resetar contador quando abrir o chat
    setUnreadCount(0);
    onOpenChat();
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        relative inline-flex items-center justify-center p-2 rounded-lg
        transition-all duration-200 hover:scale-105
        bg-blue-600 hover:bg-blue-700 text-white
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      title="Abrir chat de suporte"
    >
      {/* Ícone de chat */}
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>

      {/* Badge de mensagens não lidas */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-600 rounded-lg">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </button>
  );
}
