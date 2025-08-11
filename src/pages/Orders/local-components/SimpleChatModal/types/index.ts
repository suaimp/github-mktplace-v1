/**
 * Tipos para o modal de chat simples
 */

export interface SimpleChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  orderId?: string;
  entryId?: string;
  orderItemData?: {
    product_name: string;
    product_url: string;
  };
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'support' | 'admin';
  timestamp: Date;
  isRead?: boolean;
}
