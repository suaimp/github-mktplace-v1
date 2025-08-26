/**
 * Exemplo de uso do sistema WebSocket
 * Este arquivo demonstra como usar o novo sistema WebSocket no lugar do sistema tradicional
 */

import { useState } from 'react';
import { NewChatModalWebSocket } from '../components/NewChatModalWebSocket';
import { ChatModalProps } from '../types';

/**
 * Exemplo de como integrar o NewChatModalWebSocket na OrderItemsTable
 */
export function OrderItemsTableWithWebSocket() {
  const [selectedChatItem, setSelectedChatItem] = useState<any>(null);
  const [chatModalOpen, setChatModalOpen] = useState(false);

  // Dados de exemplo - substituir pelos dados reais
  const orderId = "example-order-id";
  const orderItemData = {
    id: "example-item-id",
    product_name: "Artigo de exemplo",
    // ... outros campos
  };

  /**
   * Abre o chat WebSocket
   */
  const handleOpenWebSocketChat = (item: any) => {
    setSelectedChatItem(item);
    setChatModalOpen(true);
  };

  /**
   * Fecha o chat WebSocket
   */
  const handleCloseWebSocketChat = () => {
    setChatModalOpen(false);
    setSelectedChatItem(null);
  };

  return (
    <div>
      {/* Botão para abrir chat WebSocket */}
      <button
        onClick={() => handleOpenWebSocketChat(orderItemData)}
        className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
        title="Abrir Chat WebSocket"
      >
        💬 Chat WebSocket
      </button>

      {/* Modal do Chat WebSocket */}
      {selectedChatItem && (
        <NewChatModalWebSocket
          isOpen={chatModalOpen}
          onClose={handleCloseWebSocketChat}
          orderId={orderId}
          orderItemId={selectedChatItem.id}
          entryId={selectedChatItem.entry_id}
          orderItemData={selectedChatItem}
        />
      )}
    </div>
  );
}

/**
 * Hook de exemplo para migração gradual
 */
export function useWebSocketMigration() {
  const [useWebSocket, setUseWebSocket] = useState(false);

  /**
   * Ativa modo WebSocket para usuários específicos ou features flags
   */
  const enableWebSocket = () => {
    setUseWebSocket(true);
  };

  /**
   * Volta para modo tradicional
   */
  const disableWebSocket = () => {
    setUseWebSocket(false);
  };

  return {
    useWebSocket,
    enableWebSocket,
    disableWebSocket
  };
}

/**
 * Componente que escolhe entre Chat tradicional e WebSocket
 */
interface AdaptiveChatModalProps extends ChatModalProps {
  useWebSocket?: boolean;
}

export function AdaptiveChatModal({ 
  useWebSocket = false, 
  ...props 
}: AdaptiveChatModalProps) {
  
  if (useWebSocket) {
    return <NewChatModalWebSocket {...props} />;
  }
  
  // Importar e usar o ChatModal tradicional
  // return <ChatModal {...props} />;
  return null; // Placeholder
}
