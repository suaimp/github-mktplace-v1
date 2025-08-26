/**
 * Componente ChatModal com novo design
 * Responsabilidade única: Orquestrar a interface do chat com o novo design
 */

import { useMemo, useEffect, useState } from 'react';
import { ChatModalProps } from '../types';
import { useChatWebSocket } from '../hooks/websocket/useChatWebSocket';
import { useOrderData } from '../hooks/useOrderData';
import { ChatUserService, OrderParticipantInfo } from '../services/chatUserService';
import { chatStyles } from '../styles';
import { 
  ChatHeader, 
  MessagesArea, 
  ChatInput 
} from './ui';

export function NewChatModalWebSocket({
  isOpen,
  onClose,
  orderId,
  orderItemId,
  entryId
}: ChatModalProps) {
  // Estado para informações do participante
  const [participantInfo, setParticipantInfo] = useState<OrderParticipantInfo | null>(null);
  
  // Hook para buscar dados da order
  const { orderData, orderItemData } = useOrderData({ 
    orderId, 
    orderItemId, 
    isOpen 
  });
  
  // Hook WebSocket para chat
  const { 
    chatState, 
    sendMessage,
    isOtherUserOnline,
    currentUserType,
    currentUserId
  } = useChatWebSocket({
    orderId,
    orderItemId,
    entryId,
    isOpen
  });

  // Carregar informações do participante quando orderData estiver disponível
  useEffect(() => {
    if (orderData && isOpen) {
      ChatUserService.getOrderParticipantInfo(orderData)
        .then(setParticipantInfo)
        .catch(console.error);
    }
  }, [orderData, isOpen]);

  // Transforma mensagens para o formato esperado pelos componentes UI
  const formattedMessages = useMemo(() => {
    if (!currentUserType) {
      return []; // Se ainda não sabemos o tipo do usuário, não renderizar mensagens
    }

    return chatState.messages.map(msg => {
      // Determinar se a mensagem é do usuário atual ou não
      const isCurrentUser = (currentUserType === 'admin' && msg.sender === 'admin') ||
                           (currentUserType === 'user' && msg.sender === 'user');

      // Se for mensagem do usuário atual (sent), não precisa de avatar/nome
      if (isCurrentUser) {
        return {
          id: msg.id,
          content: msg.text,
          timestamp: new Date(msg.timestamp).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          sender: {
            id: msg.senderId || msg.sender, // CORREÇÃO: Usa o senderId real ou fallback
            name: '',
            avatar: '',
            type: msg.sender
          },
          isRead: msg.isRead ?? false
        };
      }

      // Se for mensagem de outro usuário (received), usar informações do participante
      let senderName = '';
      let senderId = '';

      if (msg.sender === 'admin') {
        // CORREÇÃO: Para mensagens de admin, sempre usar o senderId real da mensagem
        // O componente Message/UserAvatar irá buscar o nome e foto real do admin
        senderName = 'Admin'; // Nome temporário, será substituído pelo UserAvatar
        senderId = msg.senderId || 'admin-support'; // CORREÇÃO: Usa o senderId real da mensagem
      } else {
        // Mensagem do cliente
        if (participantInfo) {
          senderName = participantInfo.buyerName;
          senderId = msg.senderId || participantInfo.buyerId; // CORREÇÃO: Usa o senderId real da mensagem
        } else if (orderData) {
          senderName = orderData.billing_name || 'Cliente';
          senderId = msg.senderId || orderData.user_id || ''; // CORREÇÃO: Usa o senderId real da mensagem
        } else {
          senderName = 'Cliente';
          senderId = msg.senderId || 'user'; // CORREÇÃO: Usa o senderId real da mensagem
        }
      }

      return {
        id: msg.id,
        content: msg.text,
        timestamp: new Date(msg.timestamp).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        sender: {
          id: senderId,
          name: senderName,
          avatar: '', // Avatar será gerenciado pelos componentes UI
          type: msg.sender
        },
        isRead: msg.isRead ?? false
      };
    });
  }, [chatState.messages, currentUserType, participantInfo, orderData]);

  // Informações do usuário para o header
  const userInfo = useMemo(() => {
    // Se temos informações do participante, usar elas
    if (participantInfo) {
      return {
        name: participantInfo.showingUserInfo.name,
        id: participantInfo.showingUserInfo.userId
      };
    }

    // Fallback para dados da order se não temos participantInfo ainda
    if (currentUserType === 'admin' && orderData) {
      return {
        name: orderData.billing_name || 'Cliente',
        id: orderData.user_id || ''
      };
    }
    
    // Se for cliente, mostra info do admin
    return {
      name: 'Suporte',
      id: 'support-team' // CORREÇÃO: Usar ID fixo para suporte, não currentUserId
    };
  }, [participantInfo, currentUserType, orderData, currentUserId]);

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content.trim()); // sendMessage espera apenas string
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    }
  };

  // Travar o scroll do body enquanto o modal está aberto
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow || 'auto';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-99999">
      {/* Overlay com blur igual aos outros modais */}
      <div 
        className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[--background-blur]"
        onClick={onClose}
      />
      
  {/* Modal */}
      <div 
        className={chatStyles.container}
        onClick={(e) => e.stopPropagation()}
      >
        <ChatHeader
          userName={userInfo.name}
          userId={userInfo.id}
          productName={orderItemData?.product_name}
          isOnline={isOtherUserOnline}
          isConnected={chatState.isConnected}
          isLoading={chatState.isLoading}
          error={chatState.error}
          onClose={onClose}
        />

        <MessagesArea
          messages={formattedMessages}
          currentUserType={currentUserType}
          isLoading={chatState.isLoading && chatState.messages.length === 0}
        />

        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={!chatState.isConnected || chatState.isLoading}
          isLoading={chatState.isLoading}
        />
      </div>
    </div>
  );
}
