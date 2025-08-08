/**
 * Hook para gerenciar o modal de chat
 */

import { useState, useCallback } from 'react';
import { ChatMessage, ChatState } from '../types';

export function useChatModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isTyping: false,
    isConnected: false
  });

  /**
   * Abre o modal de chat
   */
  const openModal = useCallback((itemId: string) => {
    setSelectedItemId(itemId);
    setIsOpen(true);
    
    // Inicializar chat (simulado por enquanto)
    setChatState({
      messages: [
        {
          id: '1',
          text: 'Olá! Como posso ajudá-lo com este artigo?',
          sender: 'support',
          timestamp: new Date()
        }
      ],
      isTyping: false,
      isConnected: true
    });
  }, []);

  /**
   * Fecha o modal de chat
   */
  const closeModal = useCallback(() => {
    setIsOpen(false);
    setSelectedItemId('');
    setChatState({
      messages: [],
      isTyping: false,
      isConnected: false
    });
  }, []);

  /**
   * Envia uma mensagem
   */
  const sendMessage = useCallback((text: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));

    // Simular resposta automática (remover quando integrar com chat real)
    setTimeout(() => {
      const autoReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Obrigado pela sua mensagem! Nossa equipe irá respondê-lo em breve.',
        sender: 'support',
        timestamp: new Date()
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, autoReply]
      }));
    }, 1000);
  }, []);

  return {
    isOpen,
    selectedItemId,
    chatState,
    openModal,
    closeModal,
    sendMessage
  };
}
