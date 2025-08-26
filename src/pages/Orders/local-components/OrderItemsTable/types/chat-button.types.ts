/**
 * Tipos e interfaces para o componente de botão de chat da tabela de itens
 */

export interface ChatButtonProps {
  orderItemId: string;
  orderId?: string;
  entryId?: string;
  onOpenChat: () => void;
  className?: string;
  disabled?: boolean;
}

export interface ChatNotificationState {
  hasNewMessages: boolean;
  isLoading: boolean;
}
