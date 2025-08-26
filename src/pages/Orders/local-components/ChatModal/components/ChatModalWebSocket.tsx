/**
 * Componente ChatModal com suporte WebSocket
 * Responsabilidade única: Interface de usuário para chat WebSocket
 */

import { useState, useRef, useEffect } from 'react';
import { ChatModalProps } from '../types';
import { useChatWebSocket, useTypingIndicator } from '../hooks';

export function ChatModalWebSocket({
  isOpen,
  onClose,
  orderId,
  orderItemId,
  entryId,
  orderItemData
}: ChatModalProps) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Hook principal WebSocket
  const { 
    chatState, 
    error, 
    sendMessage, 
    markAsRead,
    reconnect,
    isOtherUserOnline
  } = useChatWebSocket({
    orderId,
    orderItemId,
    entryId,
    isOpen
  });

  // Hook para indicadores de digitação
  const { 
    othersTyping,
    startTyping: startTypingIndicator,
    stopTyping: stopTypingIndicator
  } = useTypingIndicator({
    orderItemId,
    userId: 'current_user_id', // TODO: Get from auth
    onTypingChange: (users) => {
      console.log('Usuários digitando:', users);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  // Travar o body ao abrir e restaurar ao fechar
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow || 'auto';
    };
  }, [isOpen]);

  // Marca como lidas quando modal abre
  useEffect(() => {
    if (isOpen && chatState.unreadCount > 0) {
      markAsRead();
    }
  }, [isOpen, chatState.unreadCount, markAsRead]);

  // Foca no input quando modal abre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async () => {
    if (!message.trim() || chatState.isTyping) return;

    const messageToSend = message.trim();
    setMessage('');
    stopTypingIndicator();
    await sendMessage(messageToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    
    // Indicador de digitação
    if (e.target.value.trim()) {
      startTypingIndicator();
      
      // Para o indicador após 3 segundos de inatividade
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        stopTypingIndicator();
      }, 3000);
    } else {
      stopTypingIndicator();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-96 h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Chat - {orderItemData?.product_name || 'Item do Pedido'}
            </h3>
            
            {/* Indicador de conexão e status do outro usuário */}
            <div className={`w-2 h-2 rounded-full ${
              chatState.isConnected && !chatState.isLoading && isOtherUserOnline ? 'bg-green-500' : 'bg-gray-400'
            }`} title={
              chatState.isLoading
                ? 'Conectando...'
                : !chatState.isConnected 
                  ? 'Desconectado' 
                  : (chatState.isConnected && isOtherUserOnline)
                    ? 'Usuário online' 
                    : 'Usuário offline'
            } />
            
            {/* Status de presença do outro usuário */}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {chatState.isLoading
                ? 'Conectando...'
                : !chatState.isConnected 
                  ? 'Desconectado' 
                  : (chatState.isConnected && isOtherUserOnline)
                    ? 'Online' 
                    : 'Offline'
              }
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Botão de reconectar */}
            {!chatState.isConnected && (
              <button
                onClick={reconnect}
                className="text-blue-600 hover:text-blue-800 text-sm"
                title="Reconectar"
              >
                🔄
              </button>
            )}
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Área de mensagens */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain"
          onWheel={(e) => {
            const el = e.currentTarget as HTMLDivElement;
            const atTop = el.scrollTop === 0;
            const atBottom = Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight;
            if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
              e.preventDefault();
            }
          }}
        >
          {chatState.isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : chatState.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Ainda não há mensagens. Envie a primeira mensagem para iniciar o chat!
              </p>
            </div>
          ) : (
            <>
              {chatState.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                    } ${msg.isTemporary ? 'opacity-50' : ''}`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${
                      msg.sender === 'user' 
                        ? 'text-blue-100' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      {msg.isTemporary && ' (Enviando...)'}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Indicador de digitação */}
              {othersTyping.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-xs text-gray-500 ml-2">Digitando...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Área de erro */}
        {error && (
          <div className="px-4 py-2 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Área de input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              disabled={chatState.isTyping}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                         dark:bg-gray-800 dark:text-white disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || chatState.isTyping}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {chatState.isTyping ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Enviar'
              )}
            </button>
          </div>
          
          {/* Status da conexão */}
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Status: {chatState.connectionStatus}
            {chatState.unreadCount > 0 && (
              <span className="ml-2 text-blue-600">
                {chatState.unreadCount} não lida{chatState.unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
