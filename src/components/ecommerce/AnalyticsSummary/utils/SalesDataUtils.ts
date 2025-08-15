import { TimePeriod, SalesChartData } from "../types/SalesData";

/**
 * Utilitários para processamento de dados de vendas
 * Princípio de Responsabilidade Única: apenas funções de transformação de dados
 */
export class SalesDataUtils {
  
  /**
   * Gera rótulos para períodos mensais do ano atual
   */
  static generateMonthlyLabels(): string[] {
    const months = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
      "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];
    return months;
  }

  /**
   * Gera rótulos para trimestres do ano atual
   */
  static generateQuarterlyLabels(year: number = new Date().getFullYear()): string[] {
    return [
      `Q1 ${year}`,
      `Q2 ${year}`,
      `Q3 ${year}`,
      `Q4 ${year}`
    ];
  }

  /**
   * Gera rótulos para os últimos 5 anos
   */
  static generateYearlyLabels(): string[] {
    const currentYear = new Date().getFullYear();
    const years: string[] = [];
    
    for (let i = 4; i >= 0; i--) {
      years.push((currentYear - i).toString());
    }
    
    return years;
  }

  /**
   * Converte Map de dados para array de dados do gráfico
   */
  static convertMapToChartData(
    dataMap: Map<string, number>,
    period: TimePeriod
  ): SalesChartData {
    let categories: string[];
    let data: number[];

    switch (period) {
      case 'monthly':
        categories = this.generateMonthlyLabels();
        data = this.fillMonthlyData(dataMap, categories);
        break;
      
      case 'quarterly':
        categories = this.generateQuarterlyLabels();
        data = this.fillQuarterlyData(dataMap, categories);
        break;
      
      case 'yearly':
        categories = this.generateYearlyLabels();
        data = this.fillYearlyData(dataMap, categories);
        break;
      
      default:
        categories = [];
        data = [];
    }

    return { categories, data };
  }

  /**
   * Preenche dados mensais, garantindo que todos os meses tenham valores
   */
  private static fillMonthlyData(dataMap: Map<string, number>, categories: string[]): number[] {
    const currentYear = new Date().getFullYear();
    const data: number[] = [];

    categories.forEach((_, index) => {
      const monthKey = `${currentYear}-${(index + 1).toString().padStart(2, '0')}`;
      data.push(dataMap.get(monthKey) || 0);
    });

    return data;
  }

  /**
   * Preenche dados trimestrais
   */
  private static fillQuarterlyData(dataMap: Map<string, number>, _categories: string[]): number[] {
    const currentYear = new Date().getFullYear();
    const data: number[] = [];

    for (let i = 1; i <= 4; i++) {
      const quarterKey = `${currentYear}-Q${i}`;
      data.push(dataMap.get(quarterKey) || 0);
    }

    return data;
  }

  /**
   * Preenche dados anuais
   */
  private static fillYearlyData(dataMap: Map<string, number>, categories: string[]): number[] {
    const data: number[] = [];

    categories.forEach(year => {
      data.push(dataMap.get(year) || 0);
    });

    return data;
  }
}
