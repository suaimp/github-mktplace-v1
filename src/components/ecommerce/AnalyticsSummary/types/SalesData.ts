/**
 * Tipos relacionados aos dados de vendas
 */

export type TimePeriod = 'monthly' | 'quarterly' | 'yearly';

export interface SalesDataPoint {
  period: string;
  sales: number;
  label: string;
}

export interface SalesChartData {
  categories: string[];
  data: number[];
}

export interface PeriodConfig {
  type: TimePeriod;
  label: string;
  format: string;
}

export interface SalesAnalyticsHookReturn {
  chartData: SalesChartData;
  activePeriod: TimePeriod;
  isLoading: boolean;
  error: string | null;
  changePeriod: (period: TimePeriod) => void;
}
