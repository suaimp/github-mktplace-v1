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
      const chatMessage = convertMessage(message);
      // Se é minha própria mensagem, apenas substitui a temporária pela definitiva
      const isOwnMessage = message.sender_id === currentUserRef.current;      
      setChatState(prev => {        
        // Verificar se mensagem já existe (evitar duplicatas)
        const messageExists = prev.messages.some(msg => msg.id === chatMessage.id);        
        if (messageExists) {          return prev;
        }
        if (isOwnMessage) {          
          // Para mensagens próprias: substitui a mensagem temporária pela definitiva
          const filteredMessages = prev.messages.filter(msg => 
            !(msg.isTemporary && msg.text === chatMessage.text)
          );          
          const newState = {
            ...prev,
            messages: [...filteredMessages, chatMessage],
            // Não aumenta unreadCount para mensagens próprias
          };          
          return newState;
        } else {          
          // Para mensagens de outros: adiciona normalmente e incrementa unread se for de admin          
          const newState = {
            ...prev,
            messages: [...prev.messages, chatMessage],
            unreadCount: chatMessage.sender === 'admin' ? prev.unreadCount + 1 : prev.unreadCount
          };          
          return newState;
        }
      });    },
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

        // 0. Verificar autenticação primeiro
        console.log(`� [WebSocket] Step 0: Verifying authentication...`);
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData?.user) {
          throw new Error('Usuário não autenticado ou token expirado');
        }
        
        // Verificar se token não está próximo do vencimento
        const session = await supabase.auth.getSession();
        if (session.data.session?.expires_at) {
          const expiresAt = new Date(session.data.session.expires_at * 1000);
          const now = new Date();
          const timeUntilExpiry = expiresAt.getTime() - now.getTime();
          
          if (timeUntilExpiry < 5 * 60 * 1000) { // Menos de 5 minutos
            console.warn(`⚠️ [WebSocket] Token expira em ${Math.round(timeUntilExpiry / 1000)}s, renovando...`);
            const { error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              console.error(`❌ [WebSocket] Erro ao renovar token:`, refreshError);
            }
          }
        }
        console.log(`✅ [WebSocket] Step 0 completed - authentication verified`);

        console.log(`�📚 [WebSocket] Step 1: Loading existing messages...`);
        // 1. Carrega mensagens existentes
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
        
        // 2.1. Verifica se conexão está realmente estabelecida
        console.log(`🔍 [WebSocket] Step 2.1: Verifying connection is ready...`);
        const isConnected = OrderChatWebSocketService.isConnectedToChat(orderItemId);
        if (!isConnected) {
          console.warn(`⚠️ [WebSocket] Connection not ready immediately, waiting...`);
          // Aguarda até 2 segundos para a conexão estar pronta
          let attempts = 0;
          const maxAttempts = 20; // 20 * 100ms = 2 segundos
          
          while (attempts < maxAttempts && !OrderChatWebSocketService.isConnectedToChat(orderItemId)) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }
          
          if (!OrderChatWebSocketService.isConnectedToChat(orderItemId)) {
            throw new Error('WebSocket conectou mas não está pronto para receber mensagens');
          }
        }
        console.log(`✅ [WebSocket] Step 2.1 completed - Connection verified and ready`);
        
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

    // Listener para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`🔐 [Auth] State change: ${event}`, { hasSession: !!session });
      
      if (event === 'TOKEN_REFRESHED') {
        console.log(`🔄 [Auth] Token refreshed, connection should be stable now`);
      } else if (event === 'SIGNED_OUT') {
        console.log(`🚪 [Auth] User signed out, disconnecting WebSocket`);
        if (isConnectedRef.current) {
          OrderChatWebSocketService.disconnectFromChat(orderItemId);
        }
      }
    });

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

      // Cleanup do listener de autenticação
      if (authListener) {
        authListener.subscription.unsubscribe();
      }

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
  // State monitoring removed for performance
  /**
   * Envia mensagem
   */
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) {      return;
    }
    try {      setError(null);
      setChatState(prev => ({ ...prev, isTyping: true }));      // Adiciona mensagem temporária na UI para feedback imediato
      const tempMessage: ChatMessage = {
        id: `temp_${Date.now()}`,
        text: message.trim(),
        sender: 'user',
        timestamp: new Date().toISOString(),
        isRead: true,
        isTemporary: true
      };      setChatState(prev => {        
        const newState = {
          ...prev,
          messages: [...prev.messages, tempMessage]
        };        
        return newState;
      });      // Verificar se usuário é admin antes de enviar
      const isAdmin = await OrderChatService.isCurrentUserAdmin();
      const senderType = isAdmin ? 'admin' : 'user';      
      // Atualizar tipo do usuário atual
      setCurrentUserType(senderType);      // Atualizar mensagem temporária com o tipo correto de sender
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, sender: senderType as 'user' | 'admin' }
            : msg
        )
      }));
      
      // Envia via WebSocket (que também salva no banco)
      await OrderChatWebSocketService.sendMessage(orderItemId, {
        order_id: orderId,
        order_item_id: orderItemId,
        entry_id: entryId,
        message: message.trim(),
        sender_type: senderType
      });
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
