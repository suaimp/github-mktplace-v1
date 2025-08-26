import { supabase } from '../../../../../lib/supabase';
import type { OrderChatMessage } from '../../../../../db-service/order-chat';

/**
 * Consulta a última mensagem não lida de um item do pedido
 */
export async function getLastUnreadMessage(orderItemId: string): Promise<OrderChatMessage | null> {
  const { data, error } = await supabase
    .from('order_chat')
    .select('*')
    .eq('order_item_id', orderItemId)
    .eq('is_read', false)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('[getLastUnreadMessage] Erro ao buscar última mensagem não lida:', error);
    return null;
  }

  return data && data.length > 0 ? data[0] : null;
}
