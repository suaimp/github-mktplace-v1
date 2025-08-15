// Componente principal
export { default } from './AnalyticsSummary';

// Hooks exportados para uso externo
export { useSalesAnalytics } from './hooks/useSalesAnalytics';

// Componentes exportados para uso externo
export { default as PeriodSelector } from './components/PeriodSelector';

// Services exportados para uso externo (export da classe, não default)
export { SalesAnalyticsService } from '../../../services/db-services/analytics-services/salesAnalyticsService';

// Types exportados para uso externo
export type { 
  SalesDataPoint, 
  SalesChartData, 
  TimePeriod, 
  PeriodConfig 
} from './types/SalesData';

// Utils exportados para uso externo
export * from './utils/SalesDataUtils'; 