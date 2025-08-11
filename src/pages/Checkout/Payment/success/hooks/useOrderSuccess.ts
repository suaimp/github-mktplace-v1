/**
 * Hook para gerenciar dados do pedido na tela de sucesso
 * Responsabilidade: Buscar e gerenciar estado dos dados do pedido após pagamento bem-sucedido
 */

import { useState, useEffect } from 'react';
import { getOrderById, Order } from '../../../../../services/db-services/marketplace-services/order/OrderService';

interface UseOrderSuccessReturn {
  orderData: Order | null;
  loading: boolean;
  error: string | null;
}

export function useOrderSuccess(orderId: string | null): UseOrderSuccessReturn {
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const loadOrderData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 [ORDER SUCCESS] Carregando dados do pedido:', orderId);
        
        const order = await getOrderById(orderId);
        
        if (order) {
          setOrderData(order);
          console.log('✅ [ORDER SUCCESS] Dados do pedido carregados:', {
            orderId: order.id,
            totalAmount: order.total_amount,
            paymentMethod: order.payment_method,
            paymentStatus: order.payment_status
          });
        } else {
          setError('Pedido não encontrado');
          console.error('❌ [ORDER SUCCESS] Pedido não encontrado:', orderId);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados do pedido';
        setError(errorMessage);
        console.error('❌ [ORDER SUCCESS] Erro ao carregar pedido:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOrderData();
  }, [orderId]);

  return {
    orderData,
    loading,
    error
  };
}
