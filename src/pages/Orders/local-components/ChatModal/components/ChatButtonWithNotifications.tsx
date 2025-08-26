/**
 * Componente de botão com notificações - ícone aparece apenas quando WebSocket receber mensagem
 */

import { useChatNotifications } from '../hooks/useChatNotifications';
import { ChatIcon } from '../../../../../icons';

interface ChatButtonWithNotificationsProps {
  orderItemId: string;
  onOpenChat: () => void;
  className?: string;
}

export const ChatButtonWithNotifications: React.FC<ChatButtonWithNotificationsProps> = ({ 
  orderItemId, 
  onOpenChat
}) => {
  console.log('🔥🔥🔥 [ChatButtonWithNotifications] COMPONENTE INICIADO! 🔥🔥🔥', {
    orderItemId,
    timestamp: new Date().toISOString()
  });
  
  console.log('🟦🟦🟦 TESTANDO SE O COMPONENTE CORRETO ESTÁ SENDO USADO 🟦🟦🟦');

  const { hasNewMessages } = useChatNotifications({ orderItemId });
  
  console.log('🎯 [ChatButtonWithNotifications] Ícone baseado em WebSocket:', {
    orderItemId,
    hasNewMessages,
    iconWillShow: hasNewMessages ? 'SIM ✅' : 'NÃO ❌',
    timestamp: new Date().toISOString()
  });

  // CRÍTICO: Log no momento exato da renderização
  console.log('🚨 [RENDER] hasNewMessages no momento do render:', hasNewMessages);
  console.log('🚨 [RENDER] Condição será:', hasNewMessages && 'VERDADEIRA');

  // Log específico para debug do ícone
  if (hasNewMessages) {
    console.log('🔴🔴🔴 ÍCONE DEVERIA ESTAR VISÍVEL AGORA! 🔴🔴🔴');
    console.log('🎨 ÍCONE PULSANTE SERÁ RENDERIZADO!', { orderItemId, hasNewMessages });
  } else {
    console.log('⚪ Ícone não visível - hasNewMessages é false no render');
  }

  if (!orderItemId) {
    console.error('❌ [ChatButtonWithNotifications] ERRO: orderItemId não fornecido!');
    return null;
  }

  return (
    <div className="relative overflow-visible" style={{ zIndex: 1 }}>
      <button
        onClick={onOpenChat}
        className="p-2 transition-all duration-200 hover:opacity-80 hover:scale-105 bg-[#677f9b] dark:bg-slate-600 dark:hover:bg-slate-500 relative overflow-visible"
        style={{ borderRadius: '12px', position: 'relative' }}
        title="Abrir chat"
        data-order-item-id={orderItemId}
      >
        <ChatIcon className="w-5 h-5 text-white" />
        
        {/* Ícone aparece apenas quando WebSocket receber mensagem */}
        {hasNewMessages && (
          <div
            className="absolute bg-red-500 rounded-full"
            style={{
              position: 'fixed',
              top: '50px',
              right: '50px',
              width: '20px',
              height: '20px',
              zIndex: 999999,
              backgroundColor: '#ef4444',
              border: '2px solid white',
              borderRadius: '50%',
              display: 'block'
            }}
          >
            <div
              className="absolute bg-red-500 rounded-full animate-ping"
              style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                backgroundColor: '#ef4444',
                borderRadius: '50%',
                opacity: 0.75,
                animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite'
              }}
            />
          </div>
        )}
      </button>
    </div>
  );
};
