/**
 * Utilitários para formatação de dados de sucesso de pagamento
 * Responsabilidade: Transformar dados brutos em formato para exibição
 */

import { Order } from '../../../../../services/db-services/marketplace-services/order/OrderService';
import { OrderSuccessData } from '../types';

/**
 * Converte dados do pedido para formato de exibição de sucesso
 */
export function formatOrderForSuccess(order: Order): OrderSuccessData {
  return {
    id: order.id,
    totalAmount: order.total_amount,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    customerName: order.billing_name,
    customerEmail: order.billing_email,
    createdAt: order.created_at
  };
}

/**
 * Formata valor monetário para exibição
 */
export function formatCurrencyDisplay(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
}

/**
 * Determina mensagem de status baseada no método de pagamento
 */
export function getPaymentStatusMessage(paymentMethod: string): {
  title: string;
  description: string;
} {
  if (paymentMethod === 'boleto') {
    return {
      title: 'Obrigado! Pagamento Pendente!',
      description: 'está aguardando processamento'
    };
  }
  
  return {
    title: 'Obrigado! Pagamento Concluído!',
    description: 'foi processado com sucesso'
  };
}
