/**
 * Componente de filtro de DA (Domain Authority)
 * Responsabilidade: Interface para filtrar por classificações de Domain Authority
 */

import React from 'react';
import { BaseFilterButton, BaseRangeFilterDropdown, BaseRangeFilterItem } from '../base';
import { useDAFilter } from '../../hooks/useDAFilter';

// Ícone Plus Circle inline como no exemplo
const PlusCircleIcon = () => (
  <svg 
    width="15" 
    height="15" 
    viewBox="0 0 15 15" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className="h-4 w-4"
  >
    <path 
      d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM7.50003 4C7.77617 4 8.00003 4.22386 8.00003 4.5V7H10.5C10.7762 7 11 7.22386 11 7.5C11 7.77614 10.7762 8 10.5 8H8.00003V10.5C8.00003 10.7761 7.77617 11 7.50003 11C7.22389 11 7.00003 10.7761 7.00003 10.5V8H4.50003C4.22389 8 4.00003 7.77614 4.00003 7.5C4.00003 7.22386 4.22389 7 4.50003 7H7.00003V4.5C7.00003 4.22386 7.22389 4 7.50003 4Z" 
      fill="currentColor" 
      fillRule="evenodd" 
      clipRule="evenodd"
    />
  </svg>
);

interface MarketplaceDADropdownProps {
    //@ts-ignore
  entries?: number;
  onFilterChange: (filterFn: (entry: any) => boolean) => void; // Tornar obrigatório
  fields?: any[];
}

export const MarketplaceDADropdown: React.FC<MarketplaceDADropdownProps> = ({
  entries = 0,
  onFilterChange,
  fields = []
}) => {
  const {
    state,
    tempCustomRange,
    isOpen,
    options,
    hasSelectedItems,
    toggleRange,
    setCustomRange,
    applyCustomRange,
    clearFilters,
    setIsOpen,
    isDAValueFiltered
  } = useDAFilter();

  // Detectar automaticamente o campo DA
  const daField = React.useMemo(() => {
    // Primeiro, tentar os tipos específicos de DA
    let foundField = fields.find(field => field.field_type === 'moz_da') || 
           fields.find(field => field.field_type === 'domain_authority');
    
    // Se não encontrou, procurar por labels que contenham DA
    if (!foundField) {
      foundField = fields.find(field => {
        const label = field.label?.toLowerCase() || '';
        return label.includes('da') || label.includes('domain authority') || label.includes('moz da') || label === 'da';
      });
    }
    
    // Se ainda não encontrou, procurar por qualquer campo que contenha "da" no ID
    if (!foundField) {
      foundField = fields.find(field => {
        const id = field.id?.toLowerCase() || '';
        return id.includes('da') || id.includes('domain') || id.includes('moz');
      });
    }
    
    return foundField;
  }, [fields]);

  // Efeito para notificar mudanças no filtro
  React.useEffect(() => {
    if (onFilterChange) {
      if (daField) {
        const filterFn = (entry: any) => {

          // Verificação básica de tipo
          if (typeof entry !== 'object' || entry === null) {
            return true; // Incluir por segurança
          }
          
          // Se não há filtros ativos, mostrar todos
          if (!hasSelectedItems) {
            return true;
          }
          
          // Verificar se tem campo DA
          const values = entry.values || entry;
          const rawDAValue = values?.[daField.id];
          
          // Se não tem valor DA, mostrar
          if (rawDAValue === null || rawDAValue === undefined) {
            return true;
          }
          
          // Extrair valor numérico
          const daValue = extractDAValue(rawDAValue);
          
          if (daValue === null) {
            return true;
          }
          
          // Aplicar filtro real
          return isDAValueFiltered(daValue);
        };
        
        // Reset call counter for debugging
        (window as any).__daFilterCallCount = 0;
        console.log('[DA Filter] Sending filter function with hasSelectedItems:', hasSelectedItems);
        onFilterChange(filterFn);
      } else {
        console.log('[DA Filter] Sending default filter (no DA field)');
        onFilterChange(() => true);
      }
    }
  }, [state.selectedRanges, state.customRange.min, state.customRange.max, daField?.id, hasSelectedItems]);

  // Função auxiliar para extrair valor de DA
  const extractDAValue = (value: any): number | null => {
    try {
      if (value === null || value === undefined) return null;
      
      if (typeof value === 'number') return value;
      
      if (typeof value === 'string') {
        const cleaned = value.replace(/,/g, '');
        const parsed = parseInt(cleaned, 10);
        return isNaN(parsed) ? null : parsed;
      }
      
      return null;
    } catch (error) {
      console.warn('[DA Filter] Error extracting DA value:', error, 'value:', value);
      return null;
    }
  };

  // Se não há campo DA, não mostrar o filtro
  if (!daField) {
    return null;
  }

  // Calcular o número de filtros selecionados
  const selectedCount = state.selectedRanges.length + (
    state.customRange.min !== null || state.customRange.max !== null ? 1 : 0
  );

  // Texto do botão
  const getButtonText = () => {
    return daField.label || 'DA';
  };

  return (
    <div className="relative">
      <BaseFilterButton
        selectedCount={selectedCount}
        onClick={() => setIsOpen(!isOpen)}
        isOpen={isOpen}
        label={getButtonText()}
        icon={<PlusCircleIcon />}
        ariaLabel={`Filtrar por DA${entries > 0 ? ` (${entries} registros)` : ''}`}
      />

      <BaseRangeFilterDropdown
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        customRangeTitle="Intervalo personalizado"
        applyButtonText="Aplicar"
        customRange={tempCustomRange}
        onCustomRangeChange={setCustomRange}
        onApplyCustomRange={applyCustomRange}
        hasSelectedItems={hasSelectedItems}
        onClearFilters={clearFilters}
      >
        {options.map((option) => (
          <BaseRangeFilterItem
            key={option.id}
            option={option}
            isSelected={state.selectedRanges.includes(option.id)}
            onSelect={toggleRange}
            showInfo={true}
          />
        ))}
      </BaseRangeFilterDropdown>
    </div>
  );
};
