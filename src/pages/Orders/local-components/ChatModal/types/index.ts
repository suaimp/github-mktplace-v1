/**
 * Tipos para o componente de chat
 */

export interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderItemId: string;
  entryId?: string;
  orderItemData?: {
    product_name: string;
    product_url: string;
  };
  buyerData?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: Date;
  isRead?: boolean;
}

export interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  isConnected: boolean;
  isLoading: boolean;
  unreadCount: number;
}
