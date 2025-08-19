/**
 * Hook para buscar dados da order
 * Responsabilidade única: Gerenciar dados da order para o chat
 */

import { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabase';

interface OrderData {
  id: string;
  user_id: string;
  billing_name: string;
  billing_email: string;
}

interface OrderItemData {
  id: string;
  product_name: string;
  product_url: string;
}

interface UseOrderDataProps {
  orderId: string;
  orderItemId?: string;
  isOpen: boolean;
}

export function useOrderData({ orderId, orderItemId, isOpen }: UseOrderDataProps) {
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [orderItemData, setOrderItemData] = useState<OrderItemData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !orderId) {
      setOrderData(null);
      setOrderItemData(null);
      setError(null);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Buscar dados da order
        const { data: orderResult, error: orderError } = await supabase
          .from('orders')
          .select('id, user_id, billing_name, billing_email')
          .eq('id', orderId)
          .single();

        if (orderError) {
          console.error('Erro ao buscar dados da order:', orderError);
          setError('Erro ao carregar dados do pedido');
          return;
        }

        setOrderData(orderResult);

        // Buscar dados do order_item se orderItemId foi fornecido
        if (orderItemId) {
          const { data: itemResult, error: itemError } = await supabase
            .from('order_items')
            .select('id, product_name, product_url')
            .eq('id', orderItemId)
            .single();

          if (itemError) {
            console.error('Erro ao buscar dados do order_item:', itemError);
            // Não definir erro aqui, pois dados da order já foram carregados
          } else {
            setOrderItemData(itemResult);
          }
        }

      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError('Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [orderId, orderItemId, isOpen]);

  return {
    orderData,
    orderItemData,
    isLoading,
    error
  };
}
