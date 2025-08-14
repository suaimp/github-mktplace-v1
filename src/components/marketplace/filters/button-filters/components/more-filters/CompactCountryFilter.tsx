/**
 * Versão compacta do filtro de país para dropdown
 * Responsabilidade: Renderizar conteúdo do filtro de país sem o botão
 */

import React from 'react';
import { useMarketplaceCountryFilter } from '../../hooks/useMarketplaceCountryFilter';

interface CompactCountryFilterProps {
  selectedCountries: string[];
  onCountriesChange: (countries: string[]) => void;
  entries: any[];
  fields: any[];
}

interface CountryItemProps {
  country: any;
  count: number;
  isSelected: boolean;
  onToggle: () => void;
}

const CountryItem: React.FC<CountryItemProps> = ({ country, count, isSelected, onToggle }) => {
  return (
    <div
      className={`relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none select-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
        isSelected ? 'bg-gray-100 dark:bg-gray-800' : ''
      }`}
      onClick={onToggle}
    >
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => {}} // Controlled by parent click
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <div className="flex items-center gap-2">
          <span className="text-lg">{country.flag}</span>
          <span className="text-gray-900 dark:text-white">
            {country.name}
          </span>
        </div>
      </div>
      <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">
        {count} sites
      </div>
    </div>
  );
};

export const CompactCountryFilter: React.FC<CompactCountryFilterProps> = ({
  selectedCountries,
  onCountriesChange,
  entries,
  fields
}) => {
  const {
    selectedCountries: internalSelected,
    searchTerm,
    selectedCount,
    filteredCountries,
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
  React.useEffect(() => {
    onCountriesChange(internalSelected);
  }, [internalSelected, onCountriesChange]);

  // Sincroniza props externas com estado interno
  React.useEffect(() => {
    setSelectedCountries(selectedCountries);
  }, [selectedCountries, setSelectedCountries]);

  return (
    <div className="space-y-3">
      {/* Campo de pesquisa */}
      <div>
        <input
          type="text"
          placeholder="Pesquisar países..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Lista de países */}
      <div className="max-h-48 overflow-y-auto space-y-1">
        {filteredCountries.map((country) => (
          <CountryItem
            key={country.countryCode}
            country={country}
            count={entryCounts[country.countryCode] || 0}
            isSelected={internalSelected.includes(country.countryCode)}
            onToggle={() => toggleCountry(country.countryCode)}
          />
        ))}
      </div>

      {/* Botão limpar filtros */}
      {selectedCount > 0 && (
        <button
          onClick={clearFilters}
          className="w-full text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          Limpar filtros ({selectedCount} selecionados)
        </button>
      )}
    </div>
  );
};
