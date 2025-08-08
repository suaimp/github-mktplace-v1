/**
 * Componente principal do modal de chat
 */

import { useState } from 'react';
import { ChatModalProps, ChatMessage } from '../types';

export function ChatModal({
  isOpen,
  onClose,
  itemId,
  orderItemData
}: ChatModalProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Olá! Como posso ajudá-lo com este artigo?',
      sender: 'support',
      timestamp: new Date()
    }
  ]);

  if (!isOpen) return null;

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Simular resposta automática
    setTimeout(() => {
      const autoReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Obrigado pela sua mensagem! Nossa equipe irá respondê-lo em breve.',
        sender: 'support',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, autoReply]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Log do itemId para evitar warning (pode ser usado futuramente)
  console.log('Chat aberto para item:', itemId);

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
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                Chat - Suporte
              </h3>
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
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    msg.sender === 'user'
                      ? 'bg-brand-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <p>{msg.text}</p>
                  <div className={`text-xs mt-1 ${
                    msg.sender === 'user' 
                      ? 'text-brand-100' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {msg.timestamp.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-4">
            <div className="flex space-x-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                rows={2}
                className="flex-1 resize-none border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Enviar
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Pressione Enter para enviar, Shift+Enter para nova linha
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
