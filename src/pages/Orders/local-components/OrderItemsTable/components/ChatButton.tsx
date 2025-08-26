/**
 * Componente de botão de chat para tabela de itens de pedido
 * Responsabilidade única: Renderizar botão de chat com indicador de novas mensagens
 */

import { ChatIcon } from '../../../../../icons';
import { useChatButtonNotifications } from '../hooks/useChatButtonNotifications';
import type { ChatButtonProps } from '../types/chat-button.types';
import { useAuth } from '../../../../../hooks';

import { useContext } from 'react';
import { TableForceUpdateContext } from '../../OrderItemsTable';



export function ChatButton({
  orderItemId,
  onOpenChat,
  className = '',
  disabled = false
}: ChatButtonProps) {


  // Hook para gerenciar notificações de novas mensagens
  const context = useContext(TableForceUpdateContext);
  const { user } = useAuth();

  // Obter o ID do usuário autenticado
  const currentUserId = user?.id;

  const { hasNewMessages: hookHasNewMessages, isLoading, markAsRead, lastUnreadMessage } = useChatButtonNotifications({ 
    orderItemId, 
    onRealtime: context?.force
  });

  const handleClick = async () => {
    // Marcar mensagens como lidas antes de abrir o chat
    if (hookHasNewMessages) {
      await markAsRead();
    }
    onOpenChat();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`
        relative p-2 transition-all duration-200 hover:opacity-80 hover:scale-105
        bg-[#677f9b] dark:bg-slate-600 dark:hover:bg-slate-500
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={{ borderRadius: '12px' }}
      title="Abrir chat de suporte"
    >
      {/* Ícone de chat */}
      <ChatIcon className="w-5 h-5 text-white" />

      {/* Indicador de novas mensagens - exibe apenas se a última mensagem não lida for de outro usuário */}
      {hookHasNewMessages && lastUnreadMessage && lastUnreadMessage.sender_id !== currentUserId && (
        (() => {
          console.log('[ChatButton] Renderizando badge de notificação. sender_id:', lastUnreadMessage.sender_id, 'currentUserId:', currentUserId, 'orderItemId:', orderItemId);
          return (
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-400 flex">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
            </span>
          );
        })()
      )}

      {/* Loading indicator removido */}
    </button>
  );
}
