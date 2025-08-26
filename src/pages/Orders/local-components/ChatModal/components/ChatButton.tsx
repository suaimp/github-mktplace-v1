/**
 * Componente de botão para abrir o chat com ícone pulsante para novas mensagens
 */

import { useChatNotifications } from '../hooks/useChatNotifications';

interface ChatButtonProps {
  orderId: string;
  orderItemId: string;
  entryId?: string;
  onOpenChat: () => void;
  className?: string;
}

export function ChatButton({ 
  orderItemId, 
  onOpenChat, 
  className = ''
}: ChatButtonProps) {
  const { hasNewMessages, isLoading } = useChatNotifications({ 
    orderItemId
  });

  const handleClick = () => {
    onOpenChat();
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        relative p-2 transition-all duration-200 hover:opacity-80 hover:scale-105
        bg-[#677f9b] dark:bg-slate-600 dark:hover:bg-slate-500 text-white
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={{ borderRadius: '12px' }}
      title="Abrir chat de suporte"
    >
      {/* Ícone de chat */}
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
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>

      {/* Ícone pulsante - MESMO TAMANHO E POSIÇÃO DO BOTÃO DE DETALHES */}
      {hasNewMessages && (
        <span className="absolute -top-1 -right-1 z-10 h-2 w-2 rounded-full bg-red-500 flex">
          <span className="absolute -z-10 inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
        </span>
      )}
      
      {/* DEBUG: Mostrar valor de hasNewMessages - REMOVER EM PRODUÇÃO */}
      {/* <div style={{position: 'absolute', top: '-20px', left: '0', fontSize: '10px', color: 'red'}}>
        {hasNewMessages ? 'TRUE' : 'FALSE'}
      </div> */}

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-600 rounded-lg">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </button>
  );
}
