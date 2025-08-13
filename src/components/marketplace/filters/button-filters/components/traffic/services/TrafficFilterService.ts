import { Site, TrafficRangeItem, TrafficFilterCriteria } from '../types/TrafficFilterTypes.js';

export class TrafficFilterService {
  private static readonly TRAFFIC_INTERVALS: TrafficRangeItem[] = [
    {
      id: 'traffic-100001-plus',
      label: '100.001+',
      min: 100001,
      max: null, // null means no upper limit
    },
    {
      id: 'traffic-10001-100000',
      label: '10.001 - 100.000',
      min: 10001,
      max: 100000,
    },
    {
      id: 'traffic-1001-10000',
      label: '1.001 - 10.000',
      min: 1001,
      max: 10000,
    },
    {
      id: 'traffic-101-1000',
      label: '101 - 1.000',
      min: 101,
      max: 1000,
    },
    {
      id: 'traffic-11-100',
      label: '11 - 100',
      min: 11,
      max: 100,
    },
    {
      id: 'traffic-1-10',
      label: '1 - 10',
      min: 1,
      max: 10,
    },
  ];

  /**
   * Detecta qual campo de tráfego usar baseado nos fields disponíveis
   */
  public static detectTrafficField(fields: any[]): any | null {
    if (!fields || fields.length === 0) return null;

    // Ordem de prioridade: ahrefs_traffic, similarweb_traffic, google_traffic
    const trafficTypes = ['ahrefs_traffic', 'similarweb_traffic', 'google_traffic'];
    
    for (const type of trafficTypes) {
      const field = fields.find(f => f.field_type === type);
      if (field) return field;
    }

    // Se não encontrou pelos tipos, procurar por labels que contenham "tráfego" ou "traffic"
    const field = fields.find(f => {
      const label = f.label?.toLowerCase() || '';
      return label.includes('tráfego') || label.includes('traffic');
    });

    return field;
  }

  /**
   * Conta quantos sites existem para cada intervalo de tráfego
   */
  public static countSitesInIntervals(entries: any[], fields: any[]): Record<string, number> {
    const counts: Record<string, number> = {};
    const intervals = this.getTrafficIntervals();
    
    // Inicializa contadores
    intervals.forEach(interval => {
      counts[interval.id] = 0;
    });

    // Detecta qual campo de tráfego usar
    const trafficField = this.detectTrafficField(fields);
    if (!trafficField) return counts;

    // Conta os sites em cada intervalo
    entries.forEach(entry => {
      // Verifica se tem structure entry.values (do marketplace) ou entry direto
      const values = entry.values || entry;
      const rawTrafficValue = values?.[trafficField.id];
      const trafficValue = this.parseAmericanNumber(rawTrafficValue);
      
      if (trafficValue > 0) {
        const interval = intervals.find(int => {
          if (int.max === null) {
            // Para o intervalo 100.001+
            return trafficValue >= int.min;
          }
          return trafficValue >= int.min && trafficValue <= int.max;
        });
        
        if (interval) {
          counts[interval.id]++;
        }
      }
    });

    return counts;
  }

  /**
   * Get all predefined traffic intervals
   */
  public static getTrafficIntervals(): TrafficRangeItem[] {
    return this.TRAFFIC_INTERVALS;
  }

  /**
   * Get traffic fields available for filtering
   */
  public static getTrafficFields(): string[] {
    return ['ahrefs_traffic', 'similarweb_traffic', 'google_traffic'];
  }

  /**
   * Check if a site has any traffic data
   */
  public static hasTrafficData(site: Site): boolean {
    const trafficFields = this.getTrafficFields();
    return trafficFields.some(field => {
      const value = site[field as keyof Site];
      return value !== null && value !== undefined && value !== 0;
    });
  }

  /**
   * Convert American format number string to number
   * Handles comma separators and converts to numeric value
   */
  public static parseAmericanNumber(value: any): number {
    if (typeof value === 'number') {
      return value;
    }
    
    if (typeof value === 'string') {
      // Remove commas and convert to number
      const cleanValue = value.replace(/,/g, '');
      const numericValue = parseFloat(cleanValue);
      return isNaN(numericValue) ? 0 : numericValue;
    }
    
    return 0;
  }

  /**
   * Get the highest traffic value from available traffic fields
   */
  public static getHighestTrafficValue(site: Site): number {
    const trafficFields = this.getTrafficFields();
    let highestValue = 0;

    trafficFields.forEach(field => {
      const rawValue = site[field as keyof Site];
      const value = this.parseAmericanNumber(rawValue);
      if (value > highestValue) {
        highestValue = value;
      }
    });

    return highestValue;
  }

  /**
   * Classify a traffic value into its corresponding interval
   */
  public static classifyTrafficValue(trafficValue: number): TrafficRangeItem | null {
    if (trafficValue === 0) return null;

    for (const interval of this.TRAFFIC_INTERVALS) {
      if (this.isValueInInterval(trafficValue, interval)) {
        return interval;
      }
    }

    return null;
  }

  /**
   * Check if a value falls within a specific interval
   */
  private static isValueInInterval(value: number, interval: TrafficRangeItem): boolean {
    const meetsMinimum = value >= interval.min;
    const meetsMaximum = interval.max === null || value <= interval.max;
    return meetsMinimum && meetsMaximum;
  }

  /**
   * Filter sites based on traffic criteria
   */
  public static filterSites(sites: Site[], criteria: TrafficFilterCriteria): Site[] {
    if (!criteria.selectedIntervals.length && !criteria.customRange) {
      return sites;
    }

    return sites.filter(site => {
      const highestTraffic = this.getHighestTrafficValue(site);
      
      // If site has no traffic data, exclude it
      if (highestTraffic === 0) {
        return false;
      }

      // Check against selected intervals
      if (criteria.selectedIntervals.length > 0) {
        const matchesInterval = criteria.selectedIntervals.some(intervalId => {
          const interval = this.TRAFFIC_INTERVALS.find(i => i.id === intervalId);
          return interval && this.isValueInInterval(highestTraffic, interval);
        });

        if (matchesInterval) {
          return true;
        }
      }

      // Check against custom range
      if (criteria.customRange) {
        const { min, max } = criteria.customRange;
        const meetsMin = min === null || highestTraffic >= min;
        const meetsMax = max === null || highestTraffic <= max;
        return meetsMin && meetsMax;
      }

      return false;
    });
  }

  /**
   * Format traffic value for display
   */
  public static formatTrafficValue(value: number): string {
    if (value === 0) return '0';
    
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    
    return value.toLocaleString();
  }

  /**
   * Validate traffic range values
   */
  public static validateTrafficRange(min: number | null, max: number | null): {
    isValid: boolean;
    error?: string;
  } {
    if (min !== null && min < 0) {
      return { isValid: false, error: 'Minimum value cannot be negative' };
    }

    if (max !== null && max < 0) {
      return { isValid: false, error: 'Maximum value cannot be negative' };
    }

    if (min !== null && max !== null && min > max) {
      return { isValid: false, error: 'Minimum value cannot be greater than maximum' };
    }

    return { isValid: true };
  }
}
