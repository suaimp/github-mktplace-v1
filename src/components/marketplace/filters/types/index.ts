export interface FilterOption {
  id: string;
  label: string;
  value: string;
  count?: number;
  icon?: React.ReactNode;
  selected?: boolean;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
}

export interface MarketplaceFilterProps {
  onFiltersChange: (filters: Record<string, string[]>) => void;
  selectedFilters: Record<string, string[]>;
  filterGroups: FilterGroup[];
}

export interface FilterDropdownProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filterGroups: FilterGroup[];
  selectedFilters: Record<string, string[]>;
  onFilterChange: (groupId: string, optionId: string, selected: boolean) => void;
  onClearFilters: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export interface FilterButtonProps {
  selectedCount: number;
  onClick: () => void;
  isOpen: boolean;
}

export interface FilterItemProps {
  option: FilterOption;
  isSelected: boolean;
  onToggle: (optionId: string, selected: boolean) => void;
}
