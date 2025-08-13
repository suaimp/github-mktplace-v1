/**
 * Filter Manager Hook
 * Responsabilidade: Interface React para o FilterManager
 */

import { useEffect, useState } from 'react';
import { FilterManager, FilterFunction, FilterState } from '../services/FilterManager';

export function useFilterManager() {
  const [, forceUpdate] = useState({});
  const filterManager = FilterManager.getInstance();

  useEffect(() => {
    const unsubscribe = filterManager.subscribe(() => {
      forceUpdate({});
    });

    return unsubscribe;
  }, [filterManager]);

  const setDAFilter = (filterFn: FilterFunction | null) => {
    filterManager.setFilter('da', filterFn);
  };

  const setTrafficFilter = (filterFn: FilterFunction | null) => {
    filterManager.setFilter('traffic', filterFn);
  };

  const setPriceFilter = (filterFn: FilterFunction | null) => {
    filterManager.setFilter('price', filterFn);
  };

  const setNicheFilter = (filterFn: FilterFunction | null) => {
    filterManager.setFilter('niche', filterFn);
  };

  const applyFilters = (entries: any[]) => {
    return filterManager.applyFilters(entries);
  };

  const getFilters = (): FilterState => {
    return filterManager.getAllFilters();
  };

  const resetFilters = () => {
    filterManager.reset();
  };

  const getVersion = () => {
    return filterManager.getVersion();
  };

  return {
    setDAFilter,
    setTrafficFilter,
    setPriceFilter,
    setNicheFilter,
    applyFilters,
    getFilters,
    resetFilters,
    getVersion
  };
}
