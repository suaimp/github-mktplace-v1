import { useState, useEffect, useCallback } from 'react';
import { TimePeriod, SalesAnalyticsHookReturn, SalesChartData } from '../types/SalesData';
import { SalesAnalyticsService } from '../../../../services/db-services/analytics-services/salesAnalyticsService';
import { SalesDataUtils } from '../utils/SalesDataUtils';

/**
 * Hook customizado para gerenciar dados de análise de vendas
 * Princípio de Responsabilidade Única: apenas lógica de estado e fetching de dados de vendas
 */
export function useSalesAnalytics(): SalesAnalyticsHookReturn {
  const [chartData, setChartData] = useState<SalesChartData>({
    categories: [],
    data: []
  });
  const [activePeriod, setActivePeriod] = useState<TimePeriod>('monthly');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carrega e processa dados de vendas baseado no período
   */
  const loadSalesData = useCallback(async (period: TimePeriod) => {
    try {
      setIsLoading(true);
      setError(null);

      const orders = await SalesAnalyticsService.getAllOrdersForAnalytics();
      let dataMap: Map<string, number>;

      switch (period) {
        case 'monthly':
          dataMap = SalesAnalyticsService.groupOrdersByMonth(orders);
          break;
        case 'quarterly':
          dataMap = SalesAnalyticsService.groupOrdersByQuarter(orders);
          break;
        case 'yearly':
          dataMap = SalesAnalyticsService.groupOrdersByYear(orders);
          break;
        default:
          dataMap = new Map();
      }

      const processedData = SalesDataUtils.convertMapToChartData(dataMap, period);
      setChartData(processedData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados de vendas';
      setError(errorMessage);
      console.error('Erro ao carregar dados de vendas:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Altera o período ativo e recarrega os dados
   */
  const changePeriod = useCallback((period: TimePeriod) => {
    setActivePeriod(period);
    loadSalesData(period);
  }, [loadSalesData]);

  // Carregar dados iniciais
  useEffect(() => {
    loadSalesData(activePeriod);
  }, [loadSalesData, activePeriod]);

  return {
    chartData,
    activePeriod,
    isLoading,
    error,
    changePeriod
  };
}
