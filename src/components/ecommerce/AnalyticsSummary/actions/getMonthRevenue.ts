import { getAllOrders } from "../../../../services/db-services/marketplace-services/order/OrderService";

// Função para calcular o faturamento do mês atual considerando apenas pedidos pagos
export async function getMonthRevenue(): Promise<number> {
  try {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const orders = await getAllOrders();
    if (!orders) return 0;
    return orders
      .filter(order => order.payment_status === "paid" &&
        order.aprovment_payment &&
        new Date(order.aprovment_payment) >= firstDay &&
        new Date(order.aprovment_payment) <= lastDay)
      .reduce((sum, order) => sum + (order.total_amount || 0), 0);
  } catch (error) {
    console.error("Erro ao calcular faturamento do mês:", error);
    return 0;
  }
} 