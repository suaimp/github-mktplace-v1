import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useSalesAnalytics } from "./hooks/useSalesAnalytics";
import PeriodSelector from "./components/PeriodSelector";

/**
 * Componente principal do gráfico de análise de vendas
 * Integra todos os hooks e componentes filhos seguindo o princípio de composição
 */
export default function AnalyticsChart() {
  // Hooks para gerenciamento de estado
  const { 
    chartData, 
    activePeriod, 
    isLoading: salesLoading, 
    error: salesError,
    changePeriod 
  } = useSalesAnalytics();

  // Configurações do gráfico ApexCharts
  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 250,
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
    },
    colors: ["#465FFF"],
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: "40%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    grid: {
      yaxis: {
        lines: { show: true },
      },
      xaxis: {
        lines: { show: false },
      },
    },
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
      },
    },
    tooltip: {
      enabled: true,
    },
  };

  const series = [
    {
      name: "Vendas",
      data: chartData.data,
    },
  ];

  // Função para obter a descrição baseada no período ativo
  const getPeriodDescription = () => {
    switch (activePeriod) {
      case 'monthly':
        return 'Análise de vendas dos últimos 12 meses';
      case 'quarterly':
        return 'Análise de vendas por trimestre do ano atual';
      case 'yearly':
        return 'Análise de vendas dos últimos 5 anos';
      default:
        return 'Análise de vendas';
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
              Vendas Mensais
            </h3>
            <span className="block text-gray-500 text-theme-sm dark:text-gray-400">
              {getPeriodDescription()}
            </span>
          </div>
          
          {/* Seletor de Período */}
          <PeriodSelector
            activePeriod={activePeriod}
            onPeriodChange={changePeriod}
            isLoading={salesLoading}
          />
        </div>

        {/* Área do Gráfico */}
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="-ml-5 min-w-[1300px] xl:min-w-full pl-2">
            <div style={{ minHeight: 265 }}>
              {salesLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-500 dark:text-gray-400">
                    Carregando dados de vendas...
                  </div>
                </div>
              ) : salesError ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-red-500 text-center">
                    <p>Erro ao carregar dados:</p>
                    <p className="text-sm mt-1">{salesError}</p>
                  </div>
                </div>
              ) : (
                <Chart 
                  options={options} 
                  series={series} 
                  type="bar" 
                  height={250} 
                />
              )}
            </div>
          </div>
        </div>
      </div>
  );
} 