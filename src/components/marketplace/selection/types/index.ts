export interface MarketplaceEntry {
  id: string;
  values: Record<string, any>;
  created_at: string;
  status: string;
}

export interface SelectionState {
  selectedEntries: string[];
  isAllSelected: boolean;
  isIndeterminate: boolean;
}

export interface SelectionHandlers {
  handleSelectEntry: (entryId: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleClearSelection: () => void;
}

export interface UseMarketplaceSelectionProps {
  currentPageEntries: MarketplaceEntry[];
  allEntries?: MarketplaceEntry[];
  scope?: 'page' | 'all';
}

export interface UseMarketplaceSelectionReturn extends SelectionState, SelectionHandlers {
  selectedCount: number;
}
