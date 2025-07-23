// Serviços para gerenciamento de exclusão de pedidos
export { OrderDeletionService } from './services/OrderDeletionService';
export type { OrderItemWithDocument, ArticleDeletionResult } from './services/OrderDeletionService';

// Hooks para exclusão de pedidos com arquivos
export { useOrderDeletionWithFiles } from './hooks/useOrderDeletionWithFiles';
export type { 
  OrderDeletionState, 
  CompleteOrderDeletionResult 
} from './hooks/useOrderDeletionWithFiles';

// Hook principal para modal de informações de pedido
export { useOrderInfoModal } from './actions/useOrderInfoModal';

// Componentes de notificação
export { OrderDeletionNotification } from './components/OrderDeletionNotification';
