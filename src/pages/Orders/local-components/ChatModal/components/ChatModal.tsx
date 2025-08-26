/**
 * Componente principal do modal de chat
 */

import { useState, useRef, useEffect } from 'react';
import { ChatModalProps } from '../types';
import { useChat } from '../hooks/useChat';

export function ChatModal({
  isOpen,
  onClose,
  orderId,
  orderItemId,
  entryId,
  orderItemData
}: ChatModalProps) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { chatState, error, sendMessage } = useChat({
    orderId,
    orderItemId,
    entryId,
    isOpen
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

  if (!isOpen) return null;

  const handleSendMessage = async () => {
    if (!message.trim() || chatState.isTyping) return;

    const messageToSend = message.trim();
    setMessage('');
    await sendMessage(messageToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black z-[999999] transition-all duration-300 ${
          isOpen ? "bg-opacity-50 visible" : "bg-opacity-0 invisible"
        }`}
        onClick={onClose}
      />
      
      {/* Chat Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl z-[999999] transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                  Chat - Suporte
                </h3>
                {!chatState.isConnected && !chatState.isLoading && (
                  <span className="w-2 h-2 bg-red-500 rounded-full" title="Desconectado" />
                )}
                {chatState.isConnected && (
                  <span className="w-2 h-2 bg-green-500 rounded-full" title="Conectado" />
                )}
              </div>
              {orderItemData && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                  {orderItemData.product_name || orderItemData.product_url}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
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
            {chatState.isLoading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {!chatState.isLoading && chatState.messages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Ainda não há mensagens. Envie a primeira mensagem para iniciar o chat!
                </p>
              </div>
            )}

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
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender === 'user' 
                      ? 'text-blue-100' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {chatState.isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  disabled={chatState.isTyping || !chatState.isConnected}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || chatState.isTyping || !chatState.isConnected}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
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
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
            
            {!chatState.isConnected && !chatState.isLoading && (
              <p className="text-xs text-red-500 mt-2">
                Conexão perdida. Verifique sua internet e recarregue a página.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
