/**
 * Componente de botão com notificações - ícone aparece apenas quando WebSocket receber mensagem
 */

import { useChatNotifications } from '../hooks/useChatNotifications';
import { ChatIcon } from '../../../../../icons';

interface ChatButtonWithNotificationsProps {
  orderItemId: string;
  onOpenChat: () => void;
  className?: string;
  isOpen?: boolean;
}

export const ChatButtonWithNotifications: React.FC<ChatButtonWithNotificationsProps> = ({ 
  orderItemId, 
  onOpenChat, 
  isOpen = false 
}) => {
  const { hasNewMessages } = useChatNotifications({ orderItemId, isOpen });
  
  console.log('🎯 [ChatButtonWithNotifications] Ícone baseado em WebSocket:', {
    orderItemId,
    hasNewMessages,
    iconWillShow: hasNewMessages ? 'SIM ✅' : 'NÃO ❌'
  });

  if (!orderItemId) {
    console.error('❌ [ChatButtonWithNotifications] ERRO: orderItemId não fornecido!');
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={onOpenChat}
        className="p-2 transition-all duration-200 hover:opacity-80 hover:scale-105 bg-[#677f9b] dark:bg-slate-600 dark:hover:bg-slate-500"
        style={{ borderRadius: '12px' }}
        title="Abrir chat"
      >
        <ChatIcon className="w-5 h-5 text-white" />
        
        {/* Ícone aparece apenas quando WebSocket receber mensagem */}
        {hasNewMessages && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse">
            <span className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75"></span>
          </span>
        )}
      </button>
    </div>
  );
};
