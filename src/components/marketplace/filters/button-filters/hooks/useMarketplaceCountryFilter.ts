/**
 * Hook para gerenciar filtros de país no marketplace
 * Responsabilidade: Estado e lógica de filtros de país
 */

import { useState, useCallback, useMemo } from 'react';
import { MarketplaceCountryFilterService } from '../services/MarketplaceCountryFilterService';
 

export const useMarketplaceCountryFilter = (initialSelected: string[] = []) => {
  const [selectedCountries, setSelectedCountries] = useState<string[]>(initialSelected);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Obtém todas as opções de países disponíveis
  const allCountryOptions = useMemo(() => {
    return MarketplaceCountryFilterService.getCountryFilterOptions();
  }, []);

  // Filtra países baseado no termo de busca
  const filteredCountries = useMemo(() => {
    if (!searchTerm.trim()) {
      return allCountryOptions;
    }
    
    const countries = MarketplaceCountryFilterService.searchCountries(searchTerm);
    return MarketplaceCountryFilterService.formatCountriesForFilter(countries);
  }, [searchTerm, allCountryOptions]);

  // Adiciona ou remove país da seleção
  const toggleCountry = useCallback((countryCode: string) => {
    setSelectedCountries(prev => {
      const isSelected = prev.includes(countryCode);
      if (isSelected) {
        return prev.filter(code => code !== countryCode);
      } else {
        return [...prev, countryCode];
      }
    });
  }, []);

  // Limpa todos os filtros selecionados
  const clearFilters = useCallback(() => {
    setSelectedCountries([]);
  }, []);

  // Verifica se um país está selecionado
  const isCountrySelected = useCallback((countryCode: string) => {
    return selectedCountries.includes(countryCode);
  }, [selectedCountries]);

  // Obtém contagem de países selecionados
  const selectedCount = selectedCountries.length;

  // Obtém informações dos países selecionados
  const selectedCountriesInfo = useMemo(() => {
    return selectedCountries.map(code => 
      MarketplaceCountryFilterService.getCountryByCode(code)
    ).filter(Boolean);
  }, [selectedCountries]);

  return {
    // Estado
    selectedCountries,
    isOpen,
    searchTerm,
    selectedCount,
    
    // Dados computados
    filteredCountries,
    selectedCountriesInfo,
    
    // Ações
    setIsOpen,
    setSearchTerm,
    toggleCountry,
    clearFilters,
    isCountrySelected,
    setSelectedCountries
  };
};
