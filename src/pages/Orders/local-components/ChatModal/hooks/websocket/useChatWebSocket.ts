/**
 * Hook principal para chat WebSocket
 * Responsabilidade única: Gerenciar estado e comunicação WebSocket do chat
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  OrderChatWebSocketService, 
  OrderChatService,
  BroadcastChatMessage,
  TypingIndicator,
  UserPresence,
  WebSocketCallbacks
} from '../../../../../../db-service/order-chat';
import { supabase } from '../../../../../../lib/supabase';
import { UserPresenceService } from '../../../../../../db-service/user-presence';
import { 
  UseChatWebSocketProps, 
  UseChatWebSocketReturn, 
  ChatWebSocketState, 
  ChatMessage 
} from './types';

/**
 * Hook para gerenciar chat WebSocket
 */
export function useChatWebSocket({
  orderId,
  orderItemId,
  entryId,
  isOpen
}: UseChatWebSocketProps): UseChatWebSocketReturn {
  console.log('🎯 [HOOK INIT] ============= useChatWebSocket INICIADO =============', {
    orderId,
    orderItemId,
    entryId,
    isOpen,
    timestamp: new Date().toISOString()
  });

  const [chatState, setChatState] = useState<ChatWebSocketState>({
    messages: [],
    isConnected: false,
    isLoading: true,
    isTyping: false,
    unreadCount: 0,
    onlineUsers: [],
    typingUsers: [],
    connectionStatus: 'DISCONNECTED',
    error: null
  });

  const [error, setError] = useState<string | null>(null);
  const isConnectedRef = useRef(false);
  const currentUserRef = useRef<string | null>(null);
  const [currentUserType, setCurrentUserType] = useState<'user' | 'admin' | null>(null);

  /**
   * Converte mensagem do banco para UI
   */
  const convertMessage = useCallback((message: any): ChatMessage => {
    return {
      id: message.id,
      text: message.message,
      sender: message.sender_type === 'admin' ? 'admin' : 'user',
      timestamp: message.created_at,
      isRead: message.is_read ?? false,
      isTemporary: false
    };
  }, []);

  /**
   * Carrega mensagens existentes do banco
   */
  const loadExistingMessages = useCallback(async () => {
    try {
      console.log(`📚 [LoadMessages] Starting to load messages`, { orderItemId, entryId });
      
      const dbMessages = await OrderChatService.getMessages({
        order_item_id: orderItemId,
        entry_id: entryId
      });

      console.log(`📚 [LoadMessages] Retrieved ${dbMessages.length} messages from database`);

      const messages = dbMessages.map(convertMessage);
      const unreadCount = messages.filter(msg => !msg.isRead && msg.sender === 'admin').length;

      console.log(`📚 [LoadMessages] Processed ${messages.length} messages, ${unreadCount} unread`);

      setChatState(prev => ({
        ...prev,
        messages,
        unreadCount,
        isLoading: false
      }));

      console.log(`📚 [LoadMessages] Updated chat state with messages`);

      // Marcar mensagens como lidas se houver não lidas
      if (unreadCount > 0) {
        console.log(`📚 [LoadMessages] Marking ${unreadCount} messages as read`);
        const unreadIds = dbMessages
          .filter(msg => !msg.is_read && msg.sender_type === 'admin')
          .map(msg => msg.id);
        
        if (unreadIds.length > 0) {
          await OrderChatService.markAsRead(unreadIds);
          console.log(`📚 [LoadMessages] Successfully marked messages as read`);
        }
      }

      console.log(`✅ [LoadMessages] Loading completed successfully`);

    } catch (err) {
      console.error('💥 [LoadMessages] Error loading messages:', err);
      setError('Falha ao carregar mensagens');
      setChatState(prev => ({ ...prev, isLoading: false }));
    }
  }, [orderItemId, entryId, convertMessage]);

  /**
   * Callbacks para WebSocket
   */
  const webSocketCallbacks: WebSocketCallbacks = useMemo(() => ({
    onMessage: (message: BroadcastChatMessage) => {
      console.log('🎯 [BROADCAST] === BROADCAST RECEBIDO ===', {
        timestamp: new Date().toISOString(),
        messageId: message.id,
        text: message.message,
        senderId: message.sender_id,
        senderType: message.sender_type,
        createdAt: message.created_at,
        orderItemId: message.order_item_id,
        currentUserId: currentUserRef.current,
        isOwnMessage: message.sender_id === currentUserRef.current
      });
      
      const chatMessage = convertMessage(message);
      console.log('🔄 [BROADCAST] Mensagem convertida:', {
        id: chatMessage.id,
        text: chatMessage.text,
        sender: chatMessage.sender,
        timestamp: chatMessage.timestamp,
        isTemporary: chatMessage.isTemporary
      });
      
      // Se é minha própria mensagem, apenas substitui a temporária pela definitiva
      const isOwnMessage = message.sender_id === currentUserRef.current;
      console.log('🔍 [BROADCAST] Análise da mensagem:', {
        isOwnMessage,
        senderId: message.sender_id,
        currentUserId: currentUserRef.current,
        willProcessAsOwnMessage: isOwnMessage,
        willProcessAsOtherMessage: !isOwnMessage
      });
      
      setChatState(prev => {
        console.log('📊 [BROADCAST] === ANÁLISE DO ESTADO ATUAL ===', {
          messagesCount: prev.messages.length,
          lastMessageId: prev.messages[prev.messages.length - 1]?.id,
          isConnected: prev.isConnected,
          connectionStatus: prev.connectionStatus,
          isOwnMessage,
          allMessageIds: prev.messages.map(m => ({ id: m.id, isTemp: m.isTemporary, text: m.text.substring(0, 20) + '...' }))
        });
        
        // Verificar se mensagem já existe (evitar duplicatas)
        const messageExists = prev.messages.some(msg => msg.id === chatMessage.id);
        
        console.log('🔍 [BROADCAST] Verificação de duplicata:', {
          messageId: chatMessage.id,
          messageExists,
          existingIds: prev.messages.map(m => m.id)
        });
        
        if (messageExists) {
          console.log('⚠️ [BROADCAST] Mensagem já existe, ignorando duplicata:', chatMessage.id);
          return prev;
        }

        if (isOwnMessage) {
          console.log('✋ [BROADCAST] Processando mensagem própria...');
          
          // Para mensagens próprias: substitui a mensagem temporária pela definitiva
          const temporaryMessages = prev.messages.filter(msg => msg.isTemporary && msg.text === chatMessage.text);
          console.log('🔍 [BROADCAST] Mensagens temporárias encontradas:', {
            count: temporaryMessages.length,
            tempIds: temporaryMessages.map(m => m.id),
            searchText: chatMessage.text
          });
          
          const filteredMessages = prev.messages.filter(msg => 
            !(msg.isTemporary && msg.text === chatMessage.text)
          );
          
          console.log('🧹 [BROADCAST] Após filtrar temporárias:', {
            originalCount: prev.messages.length,
            filteredCount: filteredMessages.length,
            removedCount: prev.messages.length - filteredMessages.length,
            finalMessageId: chatMessage.id
          });
          
          const newState = {
            ...prev,
            messages: [...filteredMessages, chatMessage],
            // Não aumenta unreadCount para mensagens próprias
          };
          
          console.log('✅ [BROADCAST] Estado final para mensagem própria:', {
            newMessagesCount: newState.messages.length,
            addedMessageId: chatMessage.id,
            finalMessagesList: newState.messages.slice(-3).map(m => ({ id: m.id, text: m.text.substring(0, 20) + '...', isTemp: m.isTemporary }))
          });
          
          return newState;
        } else {
          console.log('👥 [BROADCAST] Processando mensagem de outro usuário...');
          
          // Para mensagens de outros: adiciona normalmente e incrementa unread se for de admin
          console.log('📨 [BROADCAST] Detalhes da mensagem de outro:', {
            senderId: message.sender_id,
            senderType: message.sender_type,
            chatMessageSender: chatMessage.sender,
            willIncrementUnread: chatMessage.sender === 'admin'
          });
          
          const newState = {
            ...prev,
            messages: [...prev.messages, chatMessage],
            unreadCount: chatMessage.sender === 'admin' ? prev.unreadCount + 1 : prev.unreadCount
          };
          
          console.log('✅ [BROADCAST] Estado final para mensagem de outro:', {
            newMessagesCount: newState.messages.length,
            addedMessageId: chatMessage.id,
            newUnreadCount: newState.unreadCount,
            finalMessagesList: newState.messages.slice(-3).map(m => ({ id: m.id, text: m.text.substring(0, 20) + '...', sender: m.sender }))
          });
          
          return newState;
        }
      });
      
      console.log('🏁 [BROADCAST] === BROADCAST PROCESSADO COM SUCESSO ===', {
        messageId: chatMessage.id,
        isOwnMessage,
        timestamp: new Date().toISOString()
      });
    },

    onTyping: (typing: TypingIndicator) => {
      if (typing.userId !== currentUserRef.current) {
        setChatState(prev => {
          const typingUsers = typing.isTyping
            ? [...prev.typingUsers.filter(id => id !== typing.userId), typing.userId]
            : prev.typingUsers.filter(id => id !== typing.userId);
          
          return { ...prev, typingUsers };
        });
      }
    },

    onPresenceUpdate: (presence: UserPresence[]) => {
      setChatState(prev => ({
        ...prev,
        onlineUsers: presence
      }));
    },

    onError: (errorMessage: string) => {
      console.error(`❌ [WebSocket] Error received:`, {
        errorMessage,
        timestamp: new Date().toISOString(),
        orderItemId,
        isOpen,
        currentConnected: isConnectedRef.current
      });
      setError(errorMessage);
    },

    onConnectionChange: (connected: boolean) => {
      console.log(`🔌 [WebSocket] Connection change: ${connected ? 'CONNECTED' : 'DISCONNECTED'}`, {
        timestamp: new Date().toISOString(),
        orderItemId,
        isOpen,
        currentError: error,
        previousConnected: isConnectedRef.current
      });

      isConnectedRef.current = connected;
      setChatState(prev => ({
        ...prev,
        isConnected: connected,
        connectionStatus: connected ? 'CONNECTED' : 'DISCONNECTED'
      }));

      // Só mostra erro se estiver tentando usar o chat e perdeu conexão
      if (!connected && isOpen && error !== 'Falha na conexão WebSocket. Funcionalidade limitada.') {
        console.warn(`⚠️ [WebSocket] Setting reconnection error`, {
          isOpen,
          currentError: error,
          timestamp: new Date().toISOString()
        });
        setError('Conexão perdida. Tentando reconectar...');
        setChatState(prev => ({ 
          ...prev, 
          error: 'Conexão perdida. Tentando reconectar...'
        }));
      } else if (connected) {
        console.log(`✅ [WebSocket] Connection restored, clearing errors`);
        setError(null);
        setChatState(prev => ({ 
          ...prev, 
          error: null
        }));
      }
    }
  }), [convertMessage, isOpen, error]);

  /**
   * Conecta ao WebSocket quando modal abre
   */
  useEffect(() => {
    if (!isOpen) {
      console.log(`🚫 [WebSocket] Modal closed, resetting state`, { orderItemId });
      // Reset estado quando fecha
      setChatState(prev => ({
        ...prev,
        messages: [],
        isConnected: false,
        isLoading: false, // Importante: definir como false quando modal fecha
        typingUsers: [],
        unreadCount: 0
      }));
      setError(null);
      return;
    }

    const connectWebSocket = async () => {
      console.log(`🚀 [WebSocket] Starting connection process`, {
        orderItemId,
        isOpen,
        timestamp: new Date().toISOString()
      });

      try {
        setError(null);
        setChatState(prev => ({ 
          ...prev, 
          isLoading: true,
          error: null
        }));

        console.log(`📚 [WebSocket] Step 1: Loading existing messages...`);
        // 1. Carrega mensagens existentes - PODE ESTAR TRAVANDO AQUI
        await loadExistingMessages();
        console.log(`✅ [WebSocket] Step 1 completed - messages loaded`);

        console.log(`🔌 [WebSocket] Step 2: Connecting to WebSocket...`);
        // 2. Conecta ao WebSocket
        await OrderChatWebSocketService.connectToChat(
          orderItemId,
          webSocketCallbacks,
          {
            enablePresence: true,
            enableTyping: true,
            selfBroadcast: true // Necessário para receber confirmação das próprias mensagens no chat
          }
        );
        console.log(`✅ [WebSocket] Step 2 completed - WebSocket connected`);

        console.log(`👤 [WebSocket] Step 3: Updating user presence...`);
        // 3. Atualiza presença do usuário
        const { data: user } = await supabase.auth.getUser();
        if (user?.user) {
          console.log(`👤 [WebSocket] Got user data`, { userId: user.user.id });
          currentUserRef.current = user.user.id;
          
          // Determinar tipo do usuário (admin ou user)
          const isAdmin = await OrderChatService.isCurrentUserAdmin();
          const userType = isAdmin ? 'admin' : 'user';
          setCurrentUserType(userType);
          console.log(`👤 [WebSocket] User type determined:`, { userType });
          
          // Usar novo serviço de presença
          await UserPresenceService.setUserOnline(
            user.user.id,
            user.user.email,
            orderItemId
          );
          console.log(`✅ [WebSocket] User presence service updated`);

          // Manter compatibilidade com WebSocket
          await OrderChatWebSocketService.updateUserPresence(orderItemId, {
            userId: user.user.id,
            email: user.user.email,
            status: 'online'
          });
          console.log(`✅ [WebSocket] WebSocket presence updated`);
        }
        console.log(`✅ [WebSocket] Step 3 completed - presence updated`);

        // 4. Finalizar loading
        console.log(`🏁 [WebSocket] Step 4: Finalizing connection...`);
        setChatState(prev => ({ 
          ...prev, 
          isLoading: false,
          isConnected: true,
          connectionStatus: 'CONNECTED'
        }));
        console.log(`✅ [WebSocket] All steps completed successfully!`);

      } catch (err) {
        console.error('💥 [WebSocket] Connection failed at some step:', err, {
          orderItemId,
          timestamp: new Date().toISOString(),
          error: err
        });
        setError('Falha na conexão WebSocket. Funcionalidade limitada.');
        setChatState(prev => ({ 
          ...prev, 
          error: 'Falha na conexão WebSocket. Funcionalidade limitada.'
        }));
        setChatState(prev => ({ 
          ...prev, 
          isLoading: false,
          isConnected: false,
          connectionStatus: 'DISCONNECTED'
        }));
      }
    };

    // Timeout de segurança para garantir que loading termine
    const loadingTimeout = setTimeout(() => {
      console.warn(`⏰ [WebSocket] Loading timeout reached after 10 seconds, forcing loading to false`);
      setChatState(prev => ({ ...prev, isLoading: false }));
    }, 10000); // 10 segundos timeout

    connectWebSocket().finally(() => {
      clearTimeout(loadingTimeout);
    });

    // Cleanup quando modal fecha ou componente desmonta
    return () => {
      console.log(`🧹 [WebSocket] Cleanup triggered`, {
        orderItemId,
        isConnected: isConnectedRef.current,
        isOpen,
        timestamp: new Date().toISOString()
      });

      // Definir usuário como offline no chat específico
      if (currentUserRef.current) {
        UserPresenceService.setUserOffline(currentUserRef.current, orderItemId)
          .then(() => {
            console.log(`🔴 [WebSocket] User set offline for chat ${orderItemId}`);
          })
          .catch(err => {
            console.error(`❌ [WebSocket] Error setting user offline:`, err);
          });
      }

      if (isConnectedRef.current) {
        console.log(`🔌 [WebSocket] Disconnecting from chat...`);
        OrderChatWebSocketService.disconnectFromChat(orderItemId);
      }
    };
  }, [isOpen, orderItemId]); // Dependências limitadas para evitar reconexões desnecessárias

  // Log adicional para rastrear mudanças de estado
  useEffect(() => {
    console.log(`📊 [WebSocket] State change:`, {
      isOpen,
      isConnected: chatState.isConnected,
      connectionStatus: chatState.connectionStatus,
      messagesCount: chatState.messages.length,
      onlineUsersCount: chatState.onlineUsers.length,
      error,
      timestamp: new Date().toISOString()
    });
  }, [isOpen, chatState.isConnected, chatState.connectionStatus, chatState.messages.length, chatState.onlineUsers.length, error]);

  /**
   * Envia mensagem
   */
  const sendMessage = useCallback(async (message: string) => {
    console.log('🚀 [SEND] === BOTÃO CLICADO - SENDMESSAGE CHAMADO ===', {
      message: message.trim(),
      messageLength: message.trim().length,
      timestamp: new Date().toISOString(),
      orderItemId,
      orderId,
      entryId
    });
    console.log('🚀 [SEND] === INICIANDO ENVIO DE MENSAGEM ===', {
      message: message.trim(),
      messageLength: message.trim().length,
      timestamp: new Date().toISOString(),
      orderItemId,
      orderId,
      entryId
    });

    if (!message.trim()) {
      console.log('⚠️ [SEND] Mensagem vazia, abortando');
      return;
    }

    console.log('🔍 [SEND] Estado inicial do chat:', {
      isConnected: isConnectedRef.current,
      chatStateConnected: chatState.isConnected,
      connectionStatus: chatState.connectionStatus,
      currentUserId: currentUserRef.current,
      messagesCount: chatState.messages.length,
      isTyping: chatState.isTyping
    });

    try {
      console.log('🧹 [SEND] Limpando erros e definindo isTyping...');
      setError(null);
      setChatState(prev => ({ ...prev, isTyping: true }));

      console.log('⚡ [SEND] Criando mensagem temporária...');
      // Adiciona mensagem temporária na UI para feedback imediato
      const tempMessage: ChatMessage = {
        id: `temp_${Date.now()}`,
        text: message.trim(),
        sender: 'user',
        timestamp: new Date().toISOString(),
        isRead: true,
        isTemporary: true
      };

      console.log('📝 [SEND] Mensagem temporária criada:', {
        tempId: tempMessage.id,
        text: tempMessage.text,
        sender: tempMessage.sender,
        isTemporary: tempMessage.isTemporary
      });

      console.log('💾 [SEND] Adicionando mensagem temporária ao estado...');
      setChatState(prev => {
        console.log('📊 [SEND] Estado anterior:', {
          messagesCount: prev.messages.length,
          lastMessageId: prev.messages[prev.messages.length - 1]?.id
        });
        
        const newState = {
          ...prev,
          messages: [...prev.messages, tempMessage]
        };
        
        console.log('📊 [SEND] Novo estado:', {
          messagesCount: newState.messages.length,
          lastMessageId: newState.messages[newState.messages.length - 1]?.id,
          tempMessageAdded: newState.messages.some(m => m.id === tempMessage.id)
        });
        
        return newState;
      });

      console.log('👤 [SEND] Verificando tipo de usuário...');
      // Verificar se usuário é admin antes de enviar
      const isAdmin = await OrderChatService.isCurrentUserAdmin();
      const senderType = isAdmin ? 'admin' : 'user';
      
      console.log('👤 [SEND] Tipo de usuário determinado:', {
        isAdmin,
        senderType,
        currentUserId: currentUserRef.current
      });
      
      // Atualizar tipo do usuário atual
      setCurrentUserType(senderType);

      console.log('🔄 [SEND] Atualizando mensagem temporária com tipo correto...');
      // Atualizar mensagem temporária com o tipo correto de sender
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, sender: senderType as 'user' | 'admin' }
            : msg
        )
      }));

      console.log('📤 [SEND] Enviando mensagem via WebSocket:', {
        orderItemId,
        message: message.trim(),
        senderType,
        tempMessageId: tempMessage.id,
        currentUserId: currentUserRef.current,
        isConnected: isConnectedRef.current
      });

      console.log('🔍 [SEND] Verificando estado antes de enviar:', {
        chatStateConnected: chatState.isConnected,
        connectionStatus: chatState.connectionStatus,
        messagesCount: chatState.messages.length,
        tempMessageAdded: chatState.messages.some(m => m.id === tempMessage.id)
      });

      // Envia via WebSocket (que também salva no banco)
      console.log('⏳ [SEND] Chamando OrderChatWebSocketService.sendMessage...');
      await OrderChatWebSocketService.sendMessage(orderItemId, {
        order_id: orderId,
        order_item_id: orderItemId,
        entry_id: entryId,
        message: message.trim(),
        sender_type: senderType
      });

      console.log('✅ [SEND] OrderChatWebSocketService.sendMessage concluído com sucesso');
      console.log('⏳ [SEND] Aguardando broadcast para confirmar...');

      // Timeout de segurança: se após 10 segundos não recebeu o broadcast, remove a temporária
      setTimeout(() => {
        setChatState(prev => {
          const hasTemporary = prev.messages.some(msg => msg.id === tempMessage.id);
          if (hasTemporary) {
            console.warn('⏰ [SEND] Timeout: removendo mensagem temporária que não foi confirmada via broadcast');
            return {
              ...prev,
              messages: prev.messages.filter(msg => msg.id !== tempMessage.id),
              isTyping: false
            };
          }
          return { ...prev, isTyping: false };
        });
      }, 10000); // 10 segundos de timeout

    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      setError('Falha ao enviar mensagem');
      
      // Remove mensagem temporária em caso de erro
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => !msg.isTemporary),
        isTyping: false
      }));
    }
  }, [orderId, orderItemId, entryId]);

  /**
   * Inicia indicador de digitação
   */
  const startTyping = useCallback(() => {
    if (currentUserRef.current && isConnectedRef.current) {
      OrderChatWebSocketService.sendTypingIndicator(
        orderItemId,
        currentUserRef.current,
        true
      );
    }
  }, [orderItemId]);

  /**
   * Para indicador de digitação
   */
  const stopTyping = useCallback(() => {
    if (currentUserRef.current && isConnectedRef.current) {
      OrderChatWebSocketService.sendTypingIndicator(
        orderItemId,
        currentUserRef.current,
        false
      );
    }
  }, [orderItemId]);

  /**
   * Marca mensagens como lidas
   */
  const markAsRead = useCallback(async () => {
    try {
      if (chatState.unreadCount > 0) {
        await OrderChatService.markItemMessagesAsRead(orderItemId);
        setChatState(prev => ({ ...prev, unreadCount: 0 }));
      }
    } catch (err) {
      console.warn('Erro ao marcar como lidas:', err);
    }
  }, [orderItemId, chatState.unreadCount]);

  /**
   * Reconecta manualmente
   */
  const reconnect = useCallback(async () => {
    if (isOpen && !isConnectedRef.current) {
      try {
        setError(null);
        await OrderChatWebSocketService.connectToChat(
          orderItemId,
          webSocketCallbacks
        );
      } catch (err) {
        setError('Falha ao reconectar');
      }
    }
  }, [isOpen, orderItemId, webSocketCallbacks]);

  /**
   * Verifica se o outro usuário está online
   * Se eu sou admin, verifica se o cliente está online
   * Se eu sou cliente, verifica se algum admin está online
   */
  const isOtherUserOnline = useMemo(() => {
    // Só considera online se estiver conectado, não carregando e tem usuários
    if (!chatState.isConnected || chatState.isLoading || !currentUserRef.current || chatState.onlineUsers.length === 0) {
      return false;
    }

    // Filtra usuários online excluindo o usuário atual
    const otherUsersOnline = chatState.onlineUsers.filter(
      user => user.userId !== currentUserRef.current
    );

    return otherUsersOnline.length > 0;
  }, [chatState.onlineUsers, chatState.isConnected, chatState.isLoading]);

  return {
    chatState,
    error,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    reconnect,
    isOtherUserOnline,
    currentUserId: currentUserRef.current,
    currentUserType
  };
}
