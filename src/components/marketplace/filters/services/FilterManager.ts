/**
 * Filter Manager Service
 * Responsabilidade: Gerenciar estado e aplicação de filtros de forma funcional
 */

export type FilterFunction = (entry: any) => boolean;

export interface FilterState {
  da: FilterFunction | null;
  traffic: FilterFunction | null;
  price: FilterFunction | null;
  niche: FilterFunction | null;
}

export class FilterManager {
  private static instance: FilterManager;
  private filters: FilterState = {
    da: null,
    traffic: null,
    price: null,
    niche: null
  };
  
  private listeners: Set<() => void> = new Set();
  private version: number = 0;

  public static getInstance(): FilterManager {
    if (!FilterManager.instance) {
      FilterManager.instance = new FilterManager();
    }
    return FilterManager.instance;
  }

  public setFilter(type: keyof FilterState, filterFn: FilterFunction | null): void {
    if (this.filters[type] !== filterFn) {
      this.filters[type] = filterFn;
      this.version++;
      this.notifyListeners();
    }
  }

  public getVersion(): number {
    return this.version;
  }

  public getFilter(type: keyof FilterState): FilterFunction | null {
    return this.filters[type];
  }

  public getAllFilters(): FilterState {
    return { ...this.filters };
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback());
  }

  public applyFilters(entries: any[]): any[] {
    let result = [...entries];

    // Apply DA filter
    if (this.filters.da) {
      result = result.filter(this.filters.da);
    }

    // Apply Traffic filter
    if (this.filters.traffic) {
      result = result.filter(this.filters.traffic);
    }

    // Apply Price filter
    if (this.filters.price) {
      result = result.filter(this.filters.price);
    }

    // Apply Niche filter
    if (this.filters.niche) {
      result = result.filter(this.filters.niche);
    }

    return result;
  }

  public reset(): void {
    this.filters = {
      da: null,
      traffic: null,
      price: null,
      niche: null
    };
    this.version++;
    this.notifyListeners();
  }
}
