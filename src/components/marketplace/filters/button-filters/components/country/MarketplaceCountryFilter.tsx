/**
 * Componente principal de filtro de país no marketplace
 * Responsabilidade: Coordenar botão e dropdown de filtros de país
 */

import React, { useEffect } from 'react';
import { useMarketplaceCountryFilter } from '../../hooks/useMarketplaceCountryFilter';
import { MarketplaceCountryButton } from './MarketplaceCountryButton';
import { MarketplaceCountryDropdown } from './MarketplaceCountryDropdown';

interface MarketplaceCountryFilterProps {
  selectedCountries: string[];
  onCountriesChange: (countries: string[]) => void;
  entries?: any[];
  fields?: any[];
}

export const MarketplaceCountryFilter: React.FC<MarketplaceCountryFilterProps> = ({
  selectedCountries,
  onCountriesChange,
  entries = [],
  fields = []
}) => {
  const {
    selectedCountries: internalSelected,
    isOpen,
    searchTerm,
    selectedCount,
    filteredCountries,
    setIsOpen,
    setSearchTerm,
    toggleCountry,
    clearFilters,
    setSelectedCountries
  } = useMarketplaceCountryFilter(selectedCountries);

  // Calcular contadores de registros para cada país
  const entryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    
    // Buscar campo de país
    const countryField = fields.find(f => f.field_type === 'country');
    
    if (countryField) {
      filteredCountries.forEach(country => {
        counts[country.countryCode] = entries.filter(entry => {
          const countryValue = entry.values?.[countryField.id];
          // Country field is an object with country codes as keys
          if (countryValue && typeof countryValue === 'object') {
            const countryCodes = Object.keys(countryValue);
            return countryCodes.includes(country.countryCode.toUpperCase());
          }
          // Fallback for string values
          if (countryValue && typeof countryValue === 'string') {
            return countryValue.toUpperCase() === country.countryCode.toUpperCase();
          }
          return false;
        }).length;
      });
    }
    
    return counts;
  }, [entries, fields, filteredCountries]);

  // Sincroniza filtros internos com props externas
  useEffect(() => {
    onCountriesChange(internalSelected);
  }, [internalSelected, onCountriesChange]);

  // Sincroniza props externas com estado interno
  useEffect(() => {
    setSelectedCountries(selectedCountries);
  }, [selectedCountries, setSelectedCountries]);

  return (
    <div className="relative">
      <MarketplaceCountryButton
        selectedCount={selectedCount}
        onClick={() => setIsOpen(!isOpen)}
        isOpen={isOpen}
      />
      
      <MarketplaceCountryDropdown
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        countries={filteredCountries}
        selectedCountries={internalSelected}
        onCountryToggle={toggleCountry}
        onClearFilters={clearFilters}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        entryCounts={entryCounts}
      />
    </div>
  );
};
