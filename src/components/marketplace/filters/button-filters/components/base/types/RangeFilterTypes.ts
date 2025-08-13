/**
 * Tipos para filtros de range
 * Responsabilidade: Definir interfaces para filtros baseados em faixas de valores
 */

export interface RangeOption {
  id: string;
  label: string;
  minValue: number;
  maxValue: number;
  backgroundColor: string;
  textColor: string;
  description?: string;
  badgeText?: string; // Optional custom text for badge, fallback to id
}

export interface CustomRange {
  min: number | null;
  max: number | null;
}

export interface RangeFilterState {
  selectedRanges: string[];
  customRange: CustomRange;
}

export interface RangeFilterProps {
  options: RangeOption[];
  state: RangeFilterState;
  onRangeSelect: (rangeId: string) => void;
  onCustomRangeChange: (range: CustomRange) => void;
  onClearFilters: () => void;
  title: string;
  customRangeTitle?: string;
  applyButtonText?: string;
  emptyMessage?: string;
}
