/**
 * Hook otimizado para chat com polling + realtime
 * Responsabilidade única: Gerenciar chat de forma estável e robusta
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { OrderChatService, OrderChatMessage } from '../../../../../db-service/order-chat';
import { ChatUserService } from '../services/chatUserService';
import { ChatMessage, ChatState } from '../types';

interface UseChatStableProps {
  orderId: string;
  orderItemId: string;
  entryId?: string;
  isOpen: boolean;
}

const RECONNECT_DELAY = 3000; // 3 segundos
const MAX_RECONNECT_ATTEMPTS = 5;
const POLLING_INTERVAL = 2000; // 2 segundos para polling

/**
 * Hook robusto para chat com polling + realtime
 */
export function useChatStable({ orderId, orderItemId, entryId, isOpen }: UseChatStableProps) {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isTyping: false,
    isConnected: false,
    isLoading: false,
    unreadCount: 0
  });

  const [error, setError] = useState<string | null>(null);
  const [currentUserType, setCurrentUserType] = useState<'admin' | 'user' | null>(null);
  const channelRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isConnectingRef = useRef(false);
  const lastMessageTimestampRef = useRef<string | null>(null);

  /**
   * Converte mensagem do banco para UI
   */
  const convertMessage = useCallback((dbMessage: OrderChatMessage): ChatMessage => ({
    id: dbMessage.id,
    text: dbMessage.message,
    sender: dbMessage.sender_type === 'user' ? 'user' : 'admin',
    timestamp: new Date(dbMessage.created_at),
    isRead: dbMessage.is_read
  }), []);

  /**
   * Carrega mensagens de forma otimizada
   */
  const loadMessages = useCallback(async (isPolling = false): Promise<boolean> => {
    try {
      if (!isPolling) {
        console.log('🔄 Carregando mensagens...');
      }
      
      const dbMessages = await OrderChatService.getMessages({
        order_item_id: orderItemId,
        entry_id: entryId
      });

      const messages = dbMessages.map(convertMessage);
      const unreadCount = messages.filter(msg => !msg.isRead && msg.sender === 'admin').length;

      // Verificar se há mensagens novas (para polling)
      if (isPolling && messages.length > 0) {
        const latestTimestamp = messages[messages.length - 1].timestamp.toISOString();
        if (lastMessageTimestampRef.current === latestTimestamp) {
          return true; // Nenhuma mensagem nova
        }
        lastMessageTimestampRef.current = latestTimestamp;
        console.log('📨 [Polling] Novas mensagens detectadas');
      } else if (!isPolling && messages.length > 0) {
        lastMessageTimestampRef.current = messages[messages.length - 1].timestamp.toISOString();
      }

      setChatState(prev => ({
        ...prev,
        messages,
        unreadCount,
        isLoading: false
      }));

      // Marcar como lidas em background (não bloquear)
      if (unreadCount > 0) {
        const unreadIds = dbMessages
          .filter(msg => !msg.is_read && msg.sender_type === 'admin')
          .map(msg => msg.id);
        
        // Executar em background
        OrderChatService.markAsRead(unreadIds).catch(console.error);
      }

      if (!isPolling) {
        console.log('✅ Mensagens carregadas:', messages.length);
      }
      return true;
    } catch (err) {
      console.error('❌ Erro ao carregar mensagens:', err);
      if (!isPolling) {
        setError('Falha ao carregar mensagens');
      }
      return false;
    }
  }, [orderItemId, entryId, convertMessage]);

  /**
   * Inicia polling para fallback
   */
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return;

    console.log('🔄 [Polling] Iniciando polling de mensagens...');
    pollingIntervalRef.current = setInterval(() => {
      if (isOpen) {
        loadMessages(true);
      }
    }, POLLING_INTERVAL);
  }, [isOpen, loadMessages]);

  /**
   * Para o polling
   */
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      console.log('🔄 [Polling] Parando polling');
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  /**
   * Conecta ao realtime de forma robusta
   */
  const connectRealtime = useCallback(async (): Promise<boolean> => {
    if (isConnectingRef.current || channelRef.current) {
      console.log('🔌 Já conectando ou conectado, ignorando...');
      return true;
    }

    try {
      isConnectingRef.current = true;
      console.log('🔌 Conectando ao realtime...', { orderItemId });

      // Limpar canal anterior se existir
      if (channelRef.current) {
        console.log('🔌 Limpando canal anterior...');
        await OrderChatService.unsubscribeFromMessages(channelRef.current);
        channelRef.current = null;
      }

      // Criar novo canal
      channelRef.current = OrderChatService.subscribeToMessages(orderItemId, (newMessage) => {
        console.log('📨 [Realtime] Nova mensagem recebida:', newMessage);
        
        const chatMessage = convertMessage(newMessage);
        
        setChatState(prev => {
          // Evitar duplicatas
          const exists = prev.messages.some(msg => msg.id === chatMessage.id);
          if (exists) {
            console.log('📨 [Realtime] Mensagem já existe, ignorando duplicata:', chatMessage.id);
            return prev;
          }

          console.log('📨 [Realtime] Adicionando nova mensagem ao estado:', chatMessage.id);
          lastMessageTimestampRef.current = chatMessage.timestamp.toISOString();
          
          return {
            ...prev,
            messages: [...prev.messages, chatMessage],
            unreadCount: chatMessage.sender === 'admin' && !chatMessage.isRead 
              ? prev.unreadCount + 1 
              : prev.unreadCount
          };
        });
      });

      // Aguardar um pouco para garantir que a conexão foi estabelecida
      await new Promise(resolve => setTimeout(resolve, 1000));

      setChatState(prev => ({ 
        ...prev, 
        isConnected: true 
      }));

      reconnectAttemptsRef.current = 0;
      console.log('✅ Realtime conectado com sucesso');
      return true;

    } catch (err) {
      console.error('❌ Erro na conexão realtime:', err);
      setError('Realtime indisponível, usando polling...');
      
      // Iniciar polling como fallback
      startPolling();
      return false;
    } finally {
      isConnectingRef.current = false;
    }
  }, [orderItemId, convertMessage, startPolling]);

  /**
   * Desconecta do realtime e polling
   */
  const disconnectRealtime = useCallback(() => {
    console.log('🔌 Desconectando realtime e polling...');
    
    if (channelRef.current) {
      OrderChatService.unsubscribeFromMessages(channelRef.current);
      channelRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Parar polling também
    stopPolling();

    setChatState(prev => ({ 
      ...prev, 
      isConnected: false 
    }));
  }, [stopPolling]);

  /**
   * Reconecta automaticamente
   */
  const scheduleReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      console.log('❌ Máximo de tentativas de reconexão atingido, usando apenas polling');
      setError('Realtime indisponível, usando atualização automática...');
      startPolling(); // Usar apenas polling
      return;
    }

    reconnectAttemptsRef.current++;
    console.log(`⏳ Tentativa de reconexão ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS} em ${RECONNECT_DELAY}ms`);

    reconnectTimeoutRef.current = setTimeout(async () => {
      if (!isOpen) return; // Não reconectar se modal fechou

      console.log('🔄 Tentando reconectar...');
      const success = await connectRealtime();
      
      if (!success) {
        scheduleReconnect(); // Tentar novamente
      }
    }, RECONNECT_DELAY);
  }, [isOpen, connectRealtime, startPolling]);

  /**
   * Envia mensagem de forma robusta
   */
  const sendMessage = useCallback(async (message: string): Promise<boolean> => {
    if (!message.trim()) return false;

    try {
      setError(null);
      setChatState(prev => ({ ...prev, isTyping: true }));

      const isAdmin = await ChatUserService.isCurrentUserAdmin();
      const senderType = isAdmin ? 'admin' : 'user';

      // Atualizar tipo de usuário atual
      setCurrentUserType(isAdmin ? 'admin' : 'user');

      const newMessage = await OrderChatService.createMessage({
        order_id: orderId,
        order_item_id: orderItemId,
        entry_id: entryId,
        message: message.trim(),
        sender_type: senderType
      });

      // A mensagem será adicionada via realtime, não aqui
      console.log('✅ Mensagem enviada:', newMessage.id);
      return true;

    } catch (err) {
      console.error('❌ Erro ao enviar mensagem:', err);
      setError('Falha ao enviar mensagem');
      return false;
    } finally {
      setChatState(prev => ({ ...prev, isTyping: false }));
    }
  }, [orderId, orderItemId, entryId]);

  /**
   * Inicializa chat quando modal abre
   */
  useEffect(() => {
    if (!isOpen) {
      // Reset estado quando fecha
      setChatState({
        messages: [],
        isTyping: false,
        isConnected: false,
        isLoading: false,
        unreadCount: 0
      });
      setError(null);
      disconnectRealtime();
      return;
    }

    const initializeChat = async () => {
      console.log('🚀 Inicializando chat...');
      setChatState(prev => ({ ...prev, isLoading: true }));
      setError(null);

      // 0. Determinar tipo de usuário primeiro
      try {
        const isAdmin = await ChatUserService.isCurrentUserAdmin();
        setCurrentUserType(isAdmin ? 'admin' : 'user');
        console.log('👤 Tipo de usuário determinado:', isAdmin ? 'admin' : 'user');
      } catch (err) {
        console.error('❌ Erro ao determinar tipo de usuário:', err);
        setCurrentUserType('user'); // Default para user
      }

      // 1. Carregar mensagens primeiro (mais importante)
      const messagesLoaded = await loadMessages();
      
      // 2. Tentar conectar realtime primeiro, se falhar usar polling
      const realtimeConnected = await connectRealtime();

      if (!messagesLoaded) {
        setError('Falha ao carregar mensagens');
      } else if (!realtimeConnected) {
        console.log('⚠️ Realtime falhou, iniciando polling como fallback');
        startPolling();
        setError(null); // Limpar erro já que polling está funcionando
      }

      setChatState(prev => ({ ...prev, isLoading: false }));
    };

    initializeChat();

    // Cleanup ao desmontar
    return () => {
      disconnectRealtime();
    };
  }, [isOpen, loadMessages, connectRealtime, disconnectRealtime, scheduleReconnect, startPolling]);

  /**
   * Monitor de conexão
   */
  useEffect(() => {
    if (!isOpen || !channelRef.current) return;

    const checkConnection = setInterval(() => {
      // Verificar se o canal ainda está ativo
      if (channelRef.current && channelRef.current.state !== 'joined') {
        console.log('⚠️ Conexão perdida, tentando reconectar...');
        setChatState(prev => ({ ...prev, isConnected: false }));
        scheduleReconnect();
      }
    }, 10000); // Verificar a cada 10 segundos

    return () => clearInterval(checkConnection);
  }, [isOpen, scheduleReconnect]);

  return {
    chatState: {
      ...chatState,
      error
    },
    sendMessage,
    isOtherUserOnline: false, // Simplificado por enquanto
    currentUserType // Agora retorna o tipo real do usuário
  };
}
