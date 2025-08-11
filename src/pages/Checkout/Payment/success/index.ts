/**
 * Módulo de sucesso de pagamento
 * Responsabilidade: Exportar utilitários para tela de sucesso de pagamento
 */

export { useOrderSuccess } from './hooks/useOrderSuccess';
export { formatCurrencyDisplay, getPaymentStatusMessage, formatOrderForSuccess } from './utils/formatters';
export type { 
  OrderSuccessData, 
  PaymentSuccessDisplayProps, 
  OrderSuccessItemData 
} from './types';
