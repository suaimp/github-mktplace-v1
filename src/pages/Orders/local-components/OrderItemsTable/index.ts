/**
 * Exports do módulo OrderItemsTable
 * Centraliza todas as exportações seguindo princípio de responsabilidade única
 */

// Types
export type { 
  OrderItemStatusType, 
  OrderItemStatus, 
  OrderItemStatusContext 
} from './types/status';

export type {
  ArticleActionProps,
  ArticleActionButtonsProps
} from './types';

// Services
export { OrderItemStatusService } from './services/OrderItemStatusService';

// Utils
export { OrderItemAnalyzer } from './utils/OrderItemAnalyzer';
export * from './utils/fileActions';

// Hooks
export { useChatColumnVisibility } from './hooks';
export { useCopyToClipboard } from './hooks/useCopyToClipboard';

// Components
export * from './components';
