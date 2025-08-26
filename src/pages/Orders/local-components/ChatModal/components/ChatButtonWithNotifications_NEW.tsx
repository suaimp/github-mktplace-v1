/**
 * Componente de botão com notificações para usar na tabela de itens
 * Usa o novo sistema modular de ícone pulsante baseado em WebSocket
 */

import { usePulseIcon, PulseIcon } from '../features/pulse-icon';
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
  console.log('🎯 [ChatButtonWithNotifications] Renderizando componente:', {
    orderItemId,
    isOpen,
    timestamp: new Date().toISOString()
  });

  // Usar o novo sistema de ícone pulsante baseado em WebSocket
  const { isVisible, isLoading } = usePulseIcon({ orderItemId, isOpen });
  
  console.log('📊 [ChatButtonWithNotifications] Estado do ícone:', {
    orderItemId,
    isVisible,
    isLoading,
    isOpen,
    willShowIcon: isVisible ? 'SIM ✅' : 'NÃO ❌'
  });

  const handleClick = () => {
    console.log('🖱️ [ChatButtonWithNotifications] Botão clicado:', orderItemId);
    onOpenChat();
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="relative p-2 transition-all duration-200 hover:opacity-80 hover:scale-105 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        style={{ borderRadius: '12px' }}
        title="Abrir chat"
      >
        <ChatIcon className="w-5 h-5 text-white" />
        
        {/* Novo ícone pulsante modular - aparece apenas quando WebSocket receber mensagem */}
        <PulseIcon
          isVisible={isVisible}
          position="top-right"
          color="red"
          size="md"
        />
      </button>
    </div>
  );
};
