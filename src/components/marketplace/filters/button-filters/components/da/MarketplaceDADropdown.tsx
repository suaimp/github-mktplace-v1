/**
 * Componente de filtro de DA (Domain Authority)
 * Responsabilidade: Interface para filtrar por classificações de Domain Authority
 */

import React from 'react';
import { BaseFilterButton, BaseRangeFilterDropdown, BaseRangeFilterItem } from '../base';
import { useDAFilter } from '../../hooks/useDAFilter';

interface MarketplaceDADropdownProps {
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
        icon={
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M7 8h10M7 12h8M7 16h6" />
          </svg>
        }
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
