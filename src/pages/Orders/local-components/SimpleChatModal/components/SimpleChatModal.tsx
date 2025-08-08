/**
 * Modal de chat simples - apenas interface visual
 */

import { useState } from 'react';
import { SimpleChatModalProps, ChatMessage } from '../types';

export function SimpleChatModal({
  isOpen,
  onClose,
  itemId,
  orderItemData
}: SimpleChatModalProps) {
  const [message, setMessage] = useState('');
  const [messages] = useState<ChatMessage[]>([
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
    // Por enquanto não faz nada, apenas limpa o input
    setMessage('');
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
    <div className="fixed inset-0 flex items-center justify-center z-99999">
      {/* Overlay */}
      <div 
        className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[--background-blur]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full rounded-3xl bg-white dark:bg-gray-900 max-w-md mx-4 max-h-[600px] overflow-hidden flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
              fill="currentColor"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">
            Chat - Suporte
          </h3>
          {orderItemData && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
              {orderItemData.product_name || orderItemData.product_url}
            </p>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
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

        {/* Input Area */}
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
  );
}
