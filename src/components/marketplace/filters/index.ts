export { MarketplaceFilter } from './components/MarketplaceFilter';
export { MarketplaceCategoryFilter } from './components/MarketplaceCategoryFilter';
export { MarketplaceFilterDropdown } from './components/MarketplaceFilterDropdown';
export { MarketplaceFilterItem } from './components/MarketplaceFilterItem';
export { MarketplaceClearFiltersButton } from './components/MarketplaceClearFiltersButton';
export { MarketplaceFilterSeparator } from './components/MarketplaceFilterSeparator';

// Exportar novos componentes modulares
export * from './button-filters';
export { MarketplaceLinksFilter } from './button-filters/components/links';

export { useMarketplaceFilters } from './hooks/useMarketplaceFilters';

export { generateMarketplaceFilterGroups, FilterIcons } from './utils/filterUtils';

export type {
  FilterOption,
  FilterGroup,
  MarketplaceFilterProps,
  FilterDropdownProps,
  FilterButtonProps,
  CategoryButtonProps,
  CountryButtonProps,
  FilterItemProps
} from './types';
