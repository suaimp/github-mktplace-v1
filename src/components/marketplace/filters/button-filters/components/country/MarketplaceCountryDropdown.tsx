/**
 * Componente de dropdown para filtros de país no marketplace
 * Responsabilidade: Renderizar lista de países para seleção
 */

import React from 'react';
import { CountryFilterOption } from '../../types';
import { BaseFilterDropdown, BaseFilterItem } from '../base';

interface MarketplaceCountryDropdownProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  countries: CountryFilterOption[];
  selectedCountries: string[];
  onCountryToggle: (countryCode: string) => void;
  onClearFilters: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  entryCounts: Record<string, number>;
}

export const MarketplaceCountryDropdown: React.FC<MarketplaceCountryDropdownProps> = ({
  isOpen,
  onOpenChange,
  countries,
  selectedCountries,
  onCountryToggle,
  onClearFilters,
  searchTerm,
  onSearchChange,
  entryCounts
}) => {
  const hasSelectedCountries = selectedCountries.length > 0;

  const renderCountryIcon = (flagUrl: string, countryName: string) => (
    <img
      src={flagUrl}
      width="16"
      height="12"
      alt={`Bandeira ${countryName}`}
      className="rounded-sm"
      style={{ objectFit: 'cover' }}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
      }}
    />
  );

  return (
    <BaseFilterDropdown
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Filtrar por País"
      searchPlaceholder="Buscar países..."
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      hasSelectedItems={hasSelectedCountries}
      onClearFilters={onClearFilters}
      emptyMessage="Nenhum país encontrado"
    >
      {countries.length > 0 ? (
        countries.map((country) => (
          <BaseFilterItem
            key={country.countryCode}
            id={country.countryCode}
            label={country.label}
            isSelected={selectedCountries.includes(country.countryCode)}
            onToggle={(id) => onCountryToggle(id)}
            icon={renderCountryIcon(country.flagUrl, country.label)}
            secondaryInfo={entryCounts[country.countryCode] || 0}
          />
        ))
      ) : (
        <div className="px-2 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Nenhum país encontrado
        </div>
      )}
    </BaseFilterDropdown>
  );
};
