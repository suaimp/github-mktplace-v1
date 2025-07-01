import { Order } from "../../../../services/db-services/marketplace-services/order/OrderService";

export type { Order };

export function filterOrders(
  orders: Order[],
  search: string
): Order[] {
  if (!search.trim()) return orders;
  const lower = search.toLowerCase();
  return orders.filter((order) => {
    // Cliente
    if (order.billing_name?.toLowerCase().includes(lower)) return true;
    // Email
    if (order.billing_email?.toLowerCase().includes(lower)) return true;
    // ID (qualquer parte do id)
    if (order.id?.toLowerCase().includes(lower)) return true;
    // Valor (total_amount)
    if (
      order.total_amount?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }).includes(search) ||
      order.total_amount?.toString().includes(search)
    )
      return true;
    // Data (formato dd/mm/yyyy ou yyyy-mm-dd)
    const date = new Date(order.created_at);
    const dateStr = date.toLocaleDateString("pt-BR");
    if (dateStr.includes(search)) return true;
    if (order.created_at?.includes(search)) return true;
    return false;
  });
} 