import { getAllOrders } from "../../../../services/db-services/marketplace-services/order/OrderService";

// Função para calcular o faturamento do mês atual e do mês anterior, e a diferença percentual
export async function getMonthRevenueDiff(): Promise<{ atual: number, anterior: number, diffPercent: number }> {
  try {
    const now = new Date();
    // Mês atual
    const firstDayCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayCurrent = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    // Mês anterior
    const firstDayPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayPrev = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const orders = await getAllOrders();
    if (!orders) return { atual: 0, anterior: 0, diffPercent: 0 };

    const sum = (start: Date, end: Date) =>
      orders
        .filter(order => order.payment_status === "paid" &&
          order.aprovment_payment &&
          new Date(order.aprovment_payment) >= start &&
          new Date(order.aprovment_payment) <= end)
        .reduce((sum, order) => sum + (order.total_amount || 0), 0);

    const atual = sum(firstDayCurrent, lastDayCurrent);
    const anterior = sum(firstDayPrev, lastDayPrev);
    let diffPercent = 0;
    if (anterior > 0) {
      diffPercent = ((atual - anterior) / anterior) * 100;
    } else if (atual > 0) {
      diffPercent = 100;
    }
    return { atual, anterior, diffPercent };
  } catch (error) {
    console.error("Erro ao calcular diferença de faturamento:", error);
    return { atual: 0, anterior: 0, diffPercent: 0 };
  }
} 