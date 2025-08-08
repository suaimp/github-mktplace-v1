/**
 * Tipos para o componente de chat
 */

export interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  orderItemData?: {
    product_name: string;
    product_url: string;
  };
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
}

export interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  isConnected: boolean;
}
