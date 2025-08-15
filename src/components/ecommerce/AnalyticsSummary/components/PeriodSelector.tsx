import { TimePeriod } from '../types/SalesData';

interface PeriodSelectorProps {
  activePeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  isLoading?: boolean;
}

interface PeriodButton {
  value: TimePeriod;
  label: string;
}

/**
 * Componente responsável pela seleção de períodos de análise
 * Princípio de Responsabilidade Única: apenas interface de seleção de período
 */
export default function PeriodSelector({ 
  activePeriod, 
  onPeriodChange, 
  isLoading = false 
}: PeriodSelectorProps) {
  
  const periods: PeriodButton[] = [
    { value: 'monthly', label: 'Mensal' },
    { value: 'quarterly', label: 'Trimestral' },
    { value: 'yearly', label: 'Anual' }
  ];

  const handlePeriodClick = (period: TimePeriod) => {
    if (!isLoading && period !== activePeriod) {
      onPeriodChange(period);
    }
  };

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
      {periods.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => handlePeriodClick(value)}
          disabled={isLoading}
          className={`
            px-3 py-2 font-medium w-full rounded-md text-theme-sm transition-colors
            ${activePeriod === value
              ? 'text-gray-900 dark:text-white bg-white dark:bg-gray-800 shadow-theme-xs'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
