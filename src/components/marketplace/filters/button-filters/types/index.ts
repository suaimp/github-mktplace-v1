/**
 * Tipos e interfaces para botões de filtro do marketplace
 * Responsabilidade: Definir contratos e estruturas de dados para filtros
 */

export interface BaseButtonProps {
  selectedCount: number;
  onClick: () => void;
  isOpen: boolean;
}

export interface CategoryButtonProps extends BaseButtonProps {}

export interface CountryButtonProps extends BaseButtonProps {}

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

export interface Country {
  value: string;
  label: string;
  flag: string;
}

export interface CountryFilterOption extends FilterOption {
  flagUrl: string;
  countryCode: string;
}
