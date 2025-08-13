/**
 * Tipos para filtros de link (Dofollow/Nofollow)
 * Responsabilidade: Definir interfaces para filtro por tipo de link
 */

export interface LinkTypeFilterOption {
  id: string;
  label: string;
  value: string;
}

export interface LinkTypeFilterState {
  selectedTypes: string[];
}

export interface LinkTypeFilterProps {
  selectedLinks: string[];
  onLinksChange: (links: string[]) => void;
}
