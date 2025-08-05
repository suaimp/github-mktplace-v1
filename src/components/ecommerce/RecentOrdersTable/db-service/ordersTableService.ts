import { getAllOrders, getOrdersByUser, getOrderItems } from '../../../../services/db-services/marketplace-services/order/OrderService';
import { Order, OrderItem } from '../../../../services/db-services/marketplace-services/order/OrderService';

export interface OrderWithUrls {
  id: string;
  status: string;
  urls: string[];
  created_at: string;
}

export async function fetchOrdersWithUrls(userId?: string, isAdmin?: boolean): Promise<OrderWithUrls[]> {
  try {
    let orders: Order[] = [];
    
    if (isAdmin) {
      // Admin vê todos os pedidos, ignorando userId
      orders = await getAllOrders() || [];
      console.log('Debug - Admin mode: fetched', orders.length, 'orders');
    } else if (userId) {
      // Usuário comum vê apenas seus pedidos
      orders = await getOrdersByUser(userId) || [];
      console.log('Debug - User mode: fetched', orders.length, 'orders for user', userId);
    } else {
      // Usuário não autenticado não vê nada
      console.log('Debug - No user authenticated');
      return [];
    }

    // Para cada pedido, buscar as URLs dos order_items
    const ordersWithUrls: OrderWithUrls[] = await Promise.all(
      orders.map(async (order) => {
        const orderItems = await getOrderItems(order.id) || [];
        const urls = orderItems
          .map((item: OrderItem) => item.product_url)
          .filter((url): url is string => !!url);
        
        return {
          id: order.id,
          status: order.status,
          urls,
          created_at: order.created_at
        };
      })
    );

    return ordersWithUrls;
  } catch (error) {
    console.error('Erro ao buscar pedidos com URLs:', error);
    return [];
  }
}

export async function fetchRecentOrdersWithUrls(userId?: string, isAdmin?: boolean): Promise<OrderWithUrls[]> {
  const allOrders = await fetchOrdersWithUrls(userId, isAdmin);
  return allOrders.slice(0, 9); // Limitar aos 9 mais recentes
}
