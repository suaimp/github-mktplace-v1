import { supabase } from "../../../lib/supabase";

/**
 * Interface simplificada para análise de vendas
 */
export interface OrderForAnalytics {
  id: string;
  total_amount: number;
  created_at: string;
  payment_status: string;
}

/**
 * Serviço responsável pela análise de dados de vendas
 * Princípio de Responsabilidade Única: apenas operações relacionadas à análise de vendas
 */
export class SalesAnalyticsService {
  
  /**
   * Busca todos os pedidos pagos para análise
   */
  static async getAllOrdersForAnalytics(): Promise<OrderForAnalytics[]> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("id, total_amount, created_at, payment_status")
        .eq("payment_status", "paid")
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erro ao buscar pedidos para análise:", error);
      throw error;
    }
  }

  /**
   * Agrupa pedidos por mês
   */
  static groupOrdersByMonth(orders: OrderForAnalytics[]): Map<string, number> {
    const monthlyData = new Map<string, number>();
    
    orders.forEach(order => {
      const date = new Date(order.created_at);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      const currentCount = monthlyData.get(monthKey) || 0;
      monthlyData.set(monthKey, currentCount + 1);
    });
    
    return monthlyData;
  }

  /**
   * Agrupa pedidos por trimestre
   */
  static groupOrdersByQuarter(orders: OrderForAnalytics[]): Map<string, number> {
    const quarterlyData = new Map<string, number>();
    
    orders.forEach(order => {
      const date = new Date(order.created_at);
      const quarter = Math.ceil((date.getMonth() + 1) / 3);
      const quarterKey = `${date.getFullYear()}-Q${quarter}`;
      
      const currentCount = quarterlyData.get(quarterKey) || 0;
      quarterlyData.set(quarterKey, currentCount + 1);
    });
    
    return quarterlyData;
  }

  /**
   * Agrupa pedidos por ano
   */
  static groupOrdersByYear(orders: OrderForAnalytics[]): Map<string, number> {
    const yearlyData = new Map<string, number>();
    
    orders.forEach(order => {
      const date = new Date(order.created_at);
      const yearKey = date.getFullYear().toString();
      
      const currentCount = yearlyData.get(yearKey) || 0;
      yearlyData.set(yearKey, currentCount + 1);
    });
    
    return yearlyData;
  }
}
