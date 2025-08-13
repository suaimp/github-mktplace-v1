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

    console.log('🎯 [FilterManager] Applying filters to', entries.length, 'entries');

    // Apply DA filter
    if (this.filters.da) {
      const beforeCount = result.length;
      result = result.filter(this.filters.da);
      console.log(`🎯 [FilterManager] DA filter: ${beforeCount} → ${result.length}`);
    }

    // Apply Traffic filter
    if (this.filters.traffic) {
      const beforeCount = result.length;
      result = result.filter(this.filters.traffic);
      console.log(`🎯 [FilterManager] Traffic filter: ${beforeCount} → ${result.length}`);
    }

    // Apply Price filter
    if (this.filters.price) {
      const beforeCount = result.length;
      result = result.filter(this.filters.price);
      console.log(`🎯 [FilterManager] Price filter: ${beforeCount} → ${result.length}`);
    }

    // Apply Niche filter
    if (this.filters.niche) {
      const beforeCount = result.length;
      result = result.filter(this.filters.niche);
      console.log(`🎯 [FilterManager] Niche filter: ${beforeCount} → ${result.length}`);
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
