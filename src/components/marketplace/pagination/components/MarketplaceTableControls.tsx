import React from 'react';
import { MarketplaceTableControlsProps } from '../types';
import { MarketplaceTabNavigation } from '../../navigation';
import { MarketplaceFilter, MarketplaceCountryFilter, MarketplaceLinksFilter } from '../../filters';
import { MarketplaceDADropdown } from '../../filters/button-filters/components/da';
import { MarketplaceTrafficDropdown } from '../../filters/button-filters/components/traffic';
import { MarketplacePriceButton } from '../../filters/button-filters/components/price';
import { MarketplaceNicheFilter } from '../../filters/button-filters/components/niche';

export const MarketplaceTableControls: React.FC<MarketplaceTableControlsProps> = ({
  searchTerm,
  onSearchChange,
  tabs,
  activeTabId,
  onTabChange,
  filterGroups,
  selectedFilters,
  onFiltersChange,
  selectedCountries,
  onCountriesChange,
  selectedLinks,
  onLinksChange,
  selectedNiches,
  onNichesChange,
  onNicheFilterChange,
  onDAFilterChange,
  onTrafficFilterChange,
  onPriceFilterChange,
  entries = [],
  fields = []
}) => {
  return (
    <div className="w-full flex flex-col gap-2 px-4 py-4 border-b border-gray-100 dark:border-white/[0.05] rounded-t-xl sm:flex-row sm:items-center sm:justify-between">
      {/* Filtros na esquerda */}
      <div className="flex flex-wrap gap-2">
        <MarketplaceFilter
          filterGroups={filterGroups}
          selectedFilters={selectedFilters}
          onFiltersChange={onFiltersChange}
          entries={entries}
          fields={fields}
        />
        
        <MarketplaceCountryFilter
          selectedCountries={selectedCountries}
          onCountriesChange={onCountriesChange}
          entries={entries}
          fields={fields}
        />
        
        <MarketplaceLinksFilter
          selectedLinks={selectedLinks}
          onLinksChange={onLinksChange}
          entries={entries}
          fields={fields}
        />
        
        <MarketplaceNicheFilter
          selectedNiches={selectedNiches}
          onNichesChange={onNichesChange}
          onFilterChange={(filterFn) => {
            onNicheFilterChange?.(filterFn);
          }}
          entries={entries}
          fields={fields}
        />

        <MarketplaceDADropdown
          entries={entries}
          fields={fields}
          onFilterChange={(filterFn) => {
            onDAFilterChange?.(filterFn);
          }}
        />

        <MarketplaceTrafficDropdown
          entries={entries}
          onFilterChange={(filterFn) => {
            onTrafficFilterChange?.(filterFn);
          }}
        />
        
        <MarketplacePriceButton
          entries={entries}
          fields={fields}
          onFilterChange={(filteredEntries) => {
            const filterFn = (entry: any) => {
              return filteredEntries.some(filtered => filtered === entry);
            };
            onPriceFilterChange?.(filterFn);
          }}
        />
      </div>

      {/* Tab Navigation e Search na direita */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Tab Navigation */}
        <MarketplaceTabNavigation
          tabs={tabs}
          activeTabId={activeTabId}
          onTabChange={onTabChange}
          compact
        />

        {/* Search Input */}
        <div className="relative">
          <button
            type="button"
            className="absolute text-gray-500 -translate-y-1/2 left-4 top-1/2 dark:text-gray-400 transition-colors hover:text-black focus:text-black"
            tabIndex={0}
            aria-label="Buscar"
            onClick={() => {}}
            disabled
          >
            <svg
              className="fill-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.04199 9.37363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0032 16.5344 14.3572 15.4176L17.1773 18.238C17.4702 18.5309 17.945 18.5309 18.2379 18.238C18.5308 17.9451 18.5309 17.4703 18.238 17.1773L15.4182 14.3573C16.5367 13.0033 17.2087 11.2669 17.2087 9.37363C17.2087 5.04817 13.7014 1.54199 9.37533 1.54199Z"
                fill="currentColor"
              />
            </svg>
          </button>
          <input
            placeholder="Pesquisar..."
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-12 pr-4 text-[13px] text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
