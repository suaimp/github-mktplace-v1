import { useState, useMemo } from 'react';
import { 
  UseMarketplaceSelectionProps, 
  UseMarketplaceSelectionReturn, 
  SelectionState 
} from '../types';

/**
 * Hook para gerenciar seleção de entradas do marketplace com escopo por página.
 * 
 * Este hook foi criado para resolver o problema onde o checkbox "selecionar tudo"
 * selecionava todas as entradas de todas as páginas, não apenas da página atual.
 * 
 * @param props - Configurações do hook
 * @param props.currentPageEntries - Entradas da página atual
 * @param props.allEntries - Todas as entradas (opcional, usado quando scope='all')
 * @param props.scope - Escopo da seleção: 'page' (padrão) ou 'all'
 * 
 * @returns Estado e handlers para gerenciar seleção
 */
export function useMarketplaceSelection({
  currentPageEntries,
  allEntries = [],
  scope = 'page'
}: UseMarketplaceSelectionProps): UseMarketplaceSelectionReturn {
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);

  // Determina quais entradas usar com base no escopo
  const targetEntries = scope === 'page' ? currentPageEntries : allEntries;

  // Estados calculados
  const selectionState: SelectionState = useMemo(() => {
    const selectedCount = selectedEntries.length;
    const targetCount = targetEntries.length;
    
    const isAllSelected = targetCount > 0 && 
      targetEntries.every(entry => selectedEntries.includes(entry.id));
    
    const isIndeterminate = selectedCount > 0 && !isAllSelected;

    return {
      selectedEntries,
      isAllSelected,
      isIndeterminate
    };
  }, [selectedEntries, targetEntries]);

  // Handler para selecionar/deselecionar uma entrada individual
  const handleSelectEntry = (entryId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    
    setSelectedEntries(prev => {
      if (prev.includes(entryId)) {
        return prev.filter(id => id !== entryId);
      } else {
        return [...prev, entryId];
      }
    });
  };

  // Handler para selecionar/deselecionar todas as entradas do escopo atual
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    
    if (selectionState.isAllSelected) {
      // Se todas estão selecionadas, limpar apenas as do escopo atual
      setSelectedEntries(prev => 
        prev.filter(id => !targetEntries.some(entry => entry.id === id))
      );
    } else {
      // Selecionar todas as entradas do escopo atual, mantendo outras seleções
      const currentTargetIds = targetEntries.map(entry => entry.id);
      setSelectedEntries(prev => {
        const otherSelections = prev.filter(id => !currentTargetIds.includes(id));
        return [...otherSelections, ...currentTargetIds];
      });
    }
  };

  // Handler para limpar toda a seleção
  const handleClearSelection = () => {
    setSelectedEntries([]);
  };

  return {
    ...selectionState,
    selectedCount: selectedEntries.length,
    handleSelectEntry,
    handleSelectAll,
    handleClearSelection
  };
}
